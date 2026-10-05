import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import type { CycleDto } from './dto/cycle.dto';

// last_period_date 는 date 타입이라 그대로 두면 Date 객체로 직렬화됩니다.
// 프론트엔드가 'YYYY-MM-DD' 문자열을 기대하므로 ::text 로 캐스팅합니다.
const CYCLE_COLUMNS = `
  id,
  last_period_date::text AS "lastPeriodDate",
  cycle_length AS "cycleLength",
  period_length AS "periodLength",
  saved_at AS "savedAt"
`;

export interface CycleEntry {
  id: string;
  lastPeriodDate: string;
  cycleLength: number;
  periodLength: number;
  savedAt: Date;
}

@Injectable()
export class CyclesService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async list(userId: string): Promise<{ records: CycleEntry[] }> {
    const { rows } = await this.pool.query<CycleEntry>(
      `SELECT ${CYCLE_COLUMNS} FROM cycles WHERE user_id = $1 ORDER BY saved_at DESC`,
      [userId],
    );
    return { records: rows };
  }

  async upsert(id: string, dto: CycleDto, userId: string): Promise<{ record: CycleEntry }> {
    const now = new Date();
    const { rows } = await this.pool.query<CycleEntry>(
      `INSERT INTO cycles (
         id, user_id, last_period_date, cycle_length, period_length, saved_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, last_period_date) DO UPDATE SET
         id = EXCLUDED.id,
         cycle_length = EXCLUDED.cycle_length,
         period_length = EXCLUDED.period_length,
         saved_at = EXCLUDED.saved_at,
         updated_at = EXCLUDED.updated_at
       RETURNING ${CYCLE_COLUMNS}`,
      [id, userId, dto.lastPeriodDate, dto.cycleLength, dto.periodLength, dto.savedAt || now, now],
    );
    return { record: rows[0] };
  }

  async remove(id: string, userId: string): Promise<void> {
    const { rowCount } = await this.pool.query(
      'DELETE FROM cycles WHERE id = $1 AND user_id = $2',
      [id, userId],
    );
    if (rowCount === 0) {
      throw new NotFoundException({ error: '기록을 찾을 수 없어요.' });
    }
  }
}