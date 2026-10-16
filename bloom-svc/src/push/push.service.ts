import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Pool } from 'pg';
import * as webpush from 'web-push';
import { config } from '../config';
import { PG_POOL } from '../database/database.module';
import {
  DispatchPushDto,
  SubscribePushDto,
  TestPushDto,
} from './dto/push.dto';
import {
  evaluateCycle,
  formatUtcDate,
  getTodayKst,
  parseUtcDate,
} from './cycle-math';

export interface PushSubscriptionRecord {
  id: string;
  user_id: string | null;
  endpoint: string;
  p256dh: string;
  auth: string;
  last_period_date: string | null;
  cycle_length: number | null;
  period_length: number | null;
  notify_period_before: boolean;
  notify_fertile_before: boolean;
  notify_symptom_reminder: boolean;
  last_notified_period_date: string | null;
  last_notified_fertile_date: string | null;
  last_notified_symptom_date: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class PushService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(PushService.name);
  private vapidPublicKey: string = '';
  private vapidPrivateKey: string = '';
  private schedulerTimer: NodeJS.Timeout | null = null;

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {
    this.initVapid();
  }

  private initVapid() {
    if (config.vapidPublicKey && config.vapidPrivateKey) {
      this.vapidPublicKey = config.vapidPublicKey;
      this.vapidPrivateKey = config.vapidPrivateKey;
    } else {
      // 키가 설정되지 않은 경우 자동 생성하여 무설정 환경에서도 즉시 동작하도록 지원
      const generated = webpush.generateVAPIDKeys();
      this.vapidPublicKey = generated.publicKey;
      this.vapidPrivateKey = generated.privateKey;
      this.logger.warn(
        `[push] VAPID keys not configured in environment. Generated dynamic keys. Public key: ${this.vapidPublicKey.slice(0, 16)}...`,
      );
    }

    try {
      webpush.setVapidDetails(
        config.vapidSubject,
        this.vapidPublicKey,
        this.vapidPrivateKey,
      );
      this.logger.log(`[push] VAPID configured successfully`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`[push] Failed to configure VAPID: ${message}`);
    }
  }

  onApplicationBootstrap() {
    // 1시간마다 주기 기반 웹 푸시 알림 체크 및 자동 발송
    const ONE_HOUR = 60 * 60 * 1000;
    this.schedulerTimer = setInterval(() => {
      this.dispatchScheduled().catch((err) => {
        this.logger.error(`[push] Scheduled dispatch error: ${err.message}`);
      });
    }, ONE_HOUR);

    // 부팅 10초 후 첫 자동 체크 실행
    setTimeout(() => {
      this.dispatchScheduled().catch((err) => {
        this.logger.error(`[push] Initial dispatch error: ${err.message}`);
      });
    }, 10_000);
  }

  onModuleDestroy() {
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  getVapidPublicKey(): { publicKey: string } {
    return { publicKey: this.vapidPublicKey };
  }

  async subscribe(
    dto: SubscribePushDto,
    userId: string,
  ): Promise<{ ok: boolean; subscription: Partial<PushSubscriptionRecord> }> {
    const id = randomUUID();
    let lastPeriodDate = dto.cycleInfo?.lastPeriodDate ?? null;
    let cycleLength = dto.cycleInfo?.cycleLength ?? null;
    let periodLength = dto.cycleInfo?.periodLength ?? null;

    // 요청 본문에 주기 정보가 없다면 계정의 최신 주기 조회
    if (!lastPeriodDate || !cycleLength || !periodLength) {
      const { rows } = await this.pool.query<{
        last_period_date: string;
        cycle_length: number;
        period_length: number;
      }>(
        `SELECT to_char(last_period_date, 'YYYY-MM-DD') AS last_period_date, cycle_length, period_length
         FROM cycles
         WHERE user_id = $1
         ORDER BY saved_at DESC
         LIMIT 1`,
        [userId],
      );
      if (rows.length > 0) {
        lastPeriodDate = lastPeriodDate || rows[0].last_period_date;
        cycleLength = cycleLength || rows[0].cycle_length;
        periodLength = periodLength || rows[0].period_length;
      }
    }

    const notifyPeriodBefore = dto.preferences?.periodBefore ?? true;
    const notifyFertileBefore = dto.preferences?.fertileBefore ?? true;
    const notifySymptomReminder = dto.preferences?.symptomReminder ?? true;

    const { rows } = await this.pool.query<PushSubscriptionRecord>(
      `INSERT INTO push_subscriptions (
         id, user_id, endpoint, p256dh, auth,
         last_period_date, cycle_length, period_length,
         notify_period_before, notify_fertile_before, notify_symptom_reminder,
         updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now()
       )
       ON CONFLICT (endpoint) DO UPDATE SET
         user_id = EXCLUDED.user_id,
         p256dh = EXCLUDED.p256dh,
         auth = EXCLUDED.auth,
         last_period_date = COALESCE(EXCLUDED.last_period_date, push_subscriptions.last_period_date),
         cycle_length = COALESCE(EXCLUDED.cycle_length, push_subscriptions.cycle_length),
         period_length = COALESCE(EXCLUDED.period_length, push_subscriptions.period_length),
         notify_period_before = EXCLUDED.notify_period_before,
         notify_fertile_before = EXCLUDED.notify_fertile_before,
         notify_symptom_reminder = EXCLUDED.notify_symptom_reminder,
         updated_at = now()
       RETURNING id, endpoint, notify_period_before, notify_fertile_before, notify_symptom_reminder,
                 to_char(last_period_date, 'YYYY-MM-DD') AS last_period_date, cycle_length, period_length`,
      [
        id,
        userId,
        dto.endpoint,
        dto.keys.p256dh,
        dto.keys.auth,
        lastPeriodDate,
        cycleLength,
        periodLength,
        notifyPeriodBefore,
        notifyFertileBefore,
        notifySymptomReminder,
      ],
    );

    return { ok: true, subscription: rows[0] };
  }

  async unsubscribe(endpoint: string, userId?: string): Promise<{ ok: boolean }> {
    if (userId) {
      await this.pool.query(
        `DELETE FROM push_subscriptions WHERE endpoint = $1 AND user_id = $2`,
        [endpoint, userId],
      );
    } else {
      await this.pool.query(
        `DELETE FROM push_subscriptions WHERE endpoint = $1`,
        [endpoint],
      );
    }
    return { ok: true };
  }

  async getStatus(
    endpoint: string,
    userId: string,
  ): Promise<{
    subscribed: boolean;
    preferences?: {
      periodBefore: boolean;
      fertileBefore: boolean;
      symptomReminder: boolean;
    };
    cycleInfo?: {
      lastPeriodDate?: string;
      cycleLength?: number;
      periodLength?: number;
    };
  }> {
    const { rows } = await this.pool.query<PushSubscriptionRecord>(
      `SELECT endpoint, notify_period_before, notify_fertile_before, notify_symptom_reminder,
              to_char(last_period_date, 'YYYY-MM-DD') AS last_period_date, cycle_length, period_length
       FROM push_subscriptions
       WHERE user_id = $1 AND (endpoint = $2 OR $2 = '')
       ORDER BY updated_at DESC
       LIMIT 1`,
      [userId, endpoint],
    );

    if (rows.length === 0) {
      return { subscribed: false };
    }

    const sub = rows[0];
    return {
      subscribed: true,
      preferences: {
        periodBefore: sub.notify_period_before,
        fertileBefore: sub.notify_fertile_before,
        symptomReminder: sub.notify_symptom_reminder,
      },
      cycleInfo: {
        lastPeriodDate: sub.last_period_date || undefined,
        cycleLength: sub.cycle_length || undefined,
        periodLength: sub.period_length || undefined,
      },
    };
  }

  async sendToSubscription(
    endpoint: string,
    p256dh: string,
    auth: string,
    payload: PushPayload,
  ): Promise<boolean> {
    // 테스트 또는 더미 엔드포인트인 경우 네트워크 호출 건너뜀
    if (
      endpoint.startsWith('mock://') ||
      endpoint.includes('example.com') ||
      endpoint.startsWith('test://')
    ) {
      this.logger.log(
        `[push] Simulated push to ${endpoint}: ${payload.title} - ${payload.body}`,
      );
      return true;
    }

    try {
      await webpush.sendNotification(
        {
          endpoint,
          keys: { p256dh, auth },
        },
        JSON.stringify(payload),
      );
      return true;
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      this.logger.warn(
        `[push] Send failed to ${endpoint.slice(0, 30)}... status=${error.statusCode}: ${error.message}`,
      );

      // 404 or 410 = 브라우저에서 구독이 해제되었거나 만료됨
      if (error.statusCode === 404 || error.statusCode === 410) {
        this.logger.log(`[push] Removing expired subscription: ${endpoint}`);
        await this.unsubscribe(endpoint);
      }
      return false;
    }
  }

  async sendTest(
    dto: TestPushDto,
    userId?: string,
  ): Promise<{ ok: boolean; message: string; payload: PushPayload }> {
    const { rows } = await this.pool.query<PushSubscriptionRecord>(
      `SELECT endpoint, p256dh, auth FROM push_subscriptions
       WHERE endpoint = $1 ${userId ? 'AND user_id = $2' : ''} LIMIT 1`,
      userId ? [dto.endpoint, userId] : [dto.endpoint],
    );

    if (rows.length === 0) {
      throw new BadRequestException({
        error: '구독 정보가 없어요. 먼저 알림 권한을 허용해주세요.',
      });
    }

    const sub = rows[0];
    let payload: PushPayload;

    switch (dto.type) {
      case 'period':
        payload = {
          title: 'Bloom 🌸',
          body: '생리 시작 2일 전이에요. 따뜻한 차 한 잔 어떠세요? 🌸',
          url: '/',
          tag: 'bloom-period-reminder',
        };
        break;
      case 'fertile':
        payload = {
          title: 'Bloom 🌱',
          body: '내일부터 가임기가 시작돼요 🌱',
          url: '/',
          tag: 'bloom-fertile-reminder',
        };
        break;
      case 'symptom':
        payload = {
          title: 'Bloom ✨',
          body: '오늘 하루 컨디션은 어떠셨나요? 증상을 기록해 보세요 ✨',
          url: '/symptoms',
          tag: 'bloom-symptom-reminder',
        };
        break;
      case 'custom':
        payload = {
          title: dto.title || 'Bloom 🌸',
          body: dto.body || 'Bloom 알림이 성공적으로 연결되었어요!',
          url: dto.url || '/',
          tag: 'bloom-test-notification',
        };
        break;
      default:
        payload = {
          title: 'Bloom 🌸',
          body: '생리 시작 2일 전이에요. 따뜻한 차 한 잔 어떠세요? 🌸',
          url: '/',
          tag: 'bloom-period-reminder',
        };
        break;
    }

    await this.sendToSubscription(sub.endpoint, sub.p256dh, sub.auth, payload);

    return {
      ok: true,
      message: '테스트 알림을 발송했어요.',
      payload,
    };
  }

  async dispatchScheduled(
    dto?: DispatchPushDto,
  ): Promise<{
    ok: boolean;
    targetDate: string;
    evaluated: number;
    sent: { period: number; fertile: number; symptom: number };
  }> {
    const targetDate = dto?.targetDate || getTodayKst();
    const sent = { period: 0, fertile: 0, symptom: 0 };

    const { rows } = await this.pool.query<
      PushSubscriptionRecord & {
        db_last_period_date: string | null;
        db_cycle_length: number | null;
        db_period_length: number | null;
      }
    >(
      `SELECT s.*,
              to_char(COALESCE(s.last_period_date, c.last_period_date), 'YYYY-MM-DD') AS calc_last_period_date,
              COALESCE(s.cycle_length, c.cycle_length) AS calc_cycle_length,
              COALESCE(s.period_length, c.period_length) AS calc_period_length,
              to_char(s.last_notified_period_date, 'YYYY-MM-DD') AS str_last_notified_period_date,
              to_char(s.last_notified_fertile_date, 'YYYY-MM-DD') AS str_last_notified_fertile_date,
              to_char(s.last_notified_symptom_date, 'YYYY-MM-DD') AS str_last_notified_symptom_date
       FROM push_subscriptions s
       LEFT JOIN LATERAL (
         SELECT last_period_date, cycle_length, period_length
         FROM cycles
         WHERE cycles.user_id = s.user_id
         ORDER BY saved_at DESC
         LIMIT 1
       ) c ON true
       WHERE s.notify_period_before = true
          OR s.notify_fertile_before = true
          OR s.notify_symptom_reminder = true`,
    );

    for (const sub of rows as (typeof rows[0] & {
      calc_last_period_date: string | null;
      calc_cycle_length: number | null;
      str_last_notified_period_date: string | null;
      str_last_notified_fertile_date: string | null;
      str_last_notified_symptom_date: string | null;
    })[]) {
      // 1. 주기 기반 알림 (생리 시작 2일 전, 가임기 시작 1일 전)
      if (sub.calc_last_period_date && sub.calc_cycle_length) {
        const math = evaluateCycle(
          sub.calc_last_period_date,
          sub.calc_cycle_length,
          targetDate,
        );

        // [시점 1] "생리 시작 2일 전이에요. 따뜻한 차 한 잔 어떠세요? 🌸"
        if (
          sub.notify_period_before &&
          math.daysUntilNextPeriod === 2 &&
          sub.str_last_notified_period_date !== math.nextPeriodStart
        ) {
          const ok = await this.sendToSubscription(
            sub.endpoint,
            sub.p256dh,
            sub.auth,
            {
              title: 'Bloom 🌸',
              body: '생리 시작 2일 전이에요. 따뜻한 차 한 잔 어떠세요? 🌸',
              url: '/',
              tag: 'bloom-period-reminder',
            },
          );
          if (ok) {
            sent.period++;
            await this.pool.query(
              `UPDATE push_subscriptions
               SET last_notified_period_date = $1, updated_at = now()
               WHERE endpoint = $2`,
              [math.nextPeriodStart, sub.endpoint],
            );
          }
        }

        // [시점 2] "내일부터 가임기가 시작돼요 🌱"
        if (
          sub.notify_fertile_before &&
          math.daysUntilFertileWindow === 1 &&
          sub.str_last_notified_fertile_date !== math.fertileWindowStart
        ) {
          const ok = await this.sendToSubscription(
            sub.endpoint,
            sub.p256dh,
            sub.auth,
            {
              title: 'Bloom 🌱',
              body: '내일부터 가임기가 시작돼요 🌱',
              url: '/',
              tag: 'bloom-fertile-reminder',
            },
          );
          if (ok) {
            sent.fertile++;
            await this.pool.query(
              `UPDATE push_subscriptions
               SET last_notified_fertile_date = $1, updated_at = now()
               WHERE endpoint = $2`,
              [math.fertileWindowStart, sub.endpoint],
            );
          }
        }
      }

      // 2. 증상 기록 리마인더 (저녁 시간대 또는 당일 증상 미기록 시)
      // [시점 3] "오늘 하루 컨디션은 어떠셨나요? 증상을 기록해 보세요 ✨"
      if (
        sub.notify_symptom_reminder &&
        sub.str_last_notified_symptom_date !== targetDate
      ) {
        let shouldRemind = true;
        // 회원의 경우 오늘 이미 증상을 기록했는지 확인
        if (sub.user_id) {
          const { rowCount } = await this.pool.query(
            `SELECT 1 FROM symptom_logs WHERE user_id = $1 AND log_date = $2`,
            [sub.user_id, targetDate],
          );
          if (rowCount && rowCount > 0) {
            shouldRemind = false;
          }
        }

        if (shouldRemind) {
          const ok = await this.sendToSubscription(
            sub.endpoint,
            sub.p256dh,
            sub.auth,
            {
              title: 'Bloom ✨',
              body: '오늘 하루 컨디션은 어떠셨나요? 증상을 기록해 보세요 ✨',
              url: '/symptoms',
              tag: 'bloom-symptom-reminder',
            },
          );
          if (ok) {
            sent.symptom++;
            await this.pool.query(
              `UPDATE push_subscriptions
               SET last_notified_symptom_date = $1, updated_at = now()
               WHERE endpoint = $2`,
              [targetDate, sub.endpoint],
            );
          }
        }
      }
    }

    return {
      ok: true,
      targetDate,
      evaluated: rows.length,
      sent,
    };
  }
}
