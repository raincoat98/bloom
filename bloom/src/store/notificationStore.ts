import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  pushApi,
  type PushCycleInfo,
} from '../lib/api';
import { getAuthToken } from '../lib/token';
import {
  getCurrentPushSubscription,
  getNotificationPermission,
  getSwRegistration,
  isPushSupported,
  registerPushSubscription,
} from '../lib/push';

export interface NotificationPreferences {
  periodBefore: boolean;
  fertileBefore: boolean;
  symptomReminder: boolean;
}

export interface NotificationState {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  isSubscribed: boolean;
  endpoint: string | null;
  preferences: NotificationPreferences;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  bannerDismissed: boolean;

  init: () => Promise<void>;
  enableNotifications: (cycleInfo?: PushCycleInfo) => Promise<boolean>;
  disableNotifications: () => Promise<boolean>;
  updatePreferences: (
    prefs: Partial<NotificationPreferences>,
    cycleInfo?: PushCycleInfo,
  ) => Promise<void>;
  syncCycle: (cycleInfo: PushCycleInfo) => Promise<void>;
  sendTestPush: (
    type?: 'period' | 'fertile' | 'symptom' | 'custom',
  ) => Promise<boolean>;
  dismissBanner: () => void;
  clearMessages: () => void;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  periodBefore: true,
  fertileBefore: true,
  symptomReminder: true,
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      isSupported: true,
      permission: 'default',
      isSubscribed: false,
      endpoint: null,
      preferences: DEFAULT_PREFERENCES,
      isLoading: false,
      error: null,
      successMessage: null,
      bannerDismissed: false,

      init: async () => {
        const supported = isPushSupported();
        const permission = getNotificationPermission();

        set({ isSupported: supported, permission });
        if (!supported) return;

        const token = getAuthToken();
        if (!token) {
          set({ isSubscribed: false, endpoint: null });
          return;
        }

        try {
          const sub = await getCurrentPushSubscription();
          if (sub) {
            set({ isSubscribed: true, endpoint: sub.endpoint });
            try {
              const status = await pushApi.getStatus(sub.endpoint);
              if (status.subscribed && status.preferences) {
                set({
                  preferences: {
                    periodBefore: status.preferences.periodBefore,
                    fertileBefore: status.preferences.fertileBefore,
                    symptomReminder: status.preferences.symptomReminder,
                  },
                });
              }
            } catch {
              // 네트워크 오프라인 시 기존 로컬 캐시 설정 유지
            }
          } else {
            // 브라우저에 구독이 없으면 구독 상태를 false로 정합
            set({ isSubscribed: false, endpoint: null });
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          set({ error: msg });
        }
      },

      enableNotifications: async (cycleInfo?: PushCycleInfo) => {
        const token = getAuthToken();
        if (!token) {
          set({
            error: '알림 기능은 로그인 후 이용하실 수 있어요.',
          });
          return false;
        }

        if (!isPushSupported()) {
          set({
            error:
              '현재 브라우저에서는 웹 푸시를 지원하지 않아요. 모바일에서는 홈 화면에 추가 후 열어주세요.',
          });
          return false;
        }

        set({ isLoading: true, error: null, successMessage: null });

        try {
          // 1. 브라우저 알림 권한 요청
          const permissionResult = await Notification.requestPermission();
          set({ permission: permissionResult });

          if (permissionResult !== 'granted') {
            set({
              isLoading: false,
              error:
                permissionResult === 'denied'
                  ? '알림 권한이 차단되어 있어요. 브라우저 사이트 설정에서 알림을 허용해주세요.'
                  : '알림 권한이 승인되지 않았어요.',
            });
            return false;
          }

          // 2. 서버의 VAPID 공개키 조회
          const { publicKey } = await pushApi.getVapidPublicKey();

          // 3. 브라우저 PushManager 구독 생성
          const sub = await registerPushSubscription(publicKey);
          if (!sub) {
            throw new Error('서비스워커 구독을 생성할 수 없어요.');
          }

          const subJson = sub.toJSON();
          const p256dh = subJson.keys?.p256dh;
          const auth = subJson.keys?.auth;

          if (!p256dh || !auth) {
            throw new Error('푸시 암호화 키를 가져오지 못했어요.');
          }

          // 4. 백엔드에 구독 및 주기 설정 등록
          const prefs = get().preferences;
          await pushApi.subscribe({
            endpoint: sub.endpoint,
            keys: { p256dh, auth },
            preferences: prefs,
            cycleInfo,
          });

          set({
            isSubscribed: true,
            endpoint: sub.endpoint,
            isLoading: false,
            successMessage: '알림이 켜졌어요! 주요 시점에 알림을 보내드릴게요 🌸',
          });
          return true;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : '알림 등록 중 오류가 발생했어요.';
          set({ isLoading: false, error: msg });
          return false;
        }
      },

      disableNotifications: async () => {
        set({ isLoading: true, error: null, successMessage: null });
        const endpoint = get().endpoint;

        try {
          if (endpoint) {
            try {
              await pushApi.unsubscribe(endpoint);
            } catch {
              // 서버 통신 오류여도 브라우저 구독은 해제 진행
            }
          }

          const sub = await getCurrentPushSubscription();
          if (sub) {
            await sub.unsubscribe();
          }

          set({
            isSubscribed: false,
            endpoint: null,
            isLoading: false,
            successMessage: '알림이 꺼졌어요.',
          });
          return true;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : '알림 해제 중 오류가 발생했어요.';
          set({ isLoading: false, error: msg });
          return false;
        }
      },

      updatePreferences: async (
        prefs: Partial<NotificationPreferences>,
        cycleInfo?: PushCycleInfo,
      ) => {
        const nextPreferences = { ...get().preferences, ...prefs };
        set({ preferences: nextPreferences, error: null });

        const { isSubscribed, endpoint } = get();
        if (isSubscribed && endpoint) {
          try {
            const sub = await getCurrentPushSubscription();
            if (sub) {
              const subJson = sub.toJSON();
              if (subJson.keys?.p256dh && subJson.keys?.auth) {
                await pushApi.subscribe({
                  endpoint,
                  keys: {
                    p256dh: subJson.keys.p256dh,
                    auth: subJson.keys.auth,
                  },
                  preferences: nextPreferences,
                  cycleInfo,
                });
              }
            }
          } catch {
            // 오프라인이어도 로컬 설정은 적용 유지
          }
        }
      },

      syncCycle: async (cycleInfo: PushCycleInfo) => {
        const { isSubscribed, endpoint, preferences } = get();
        if (!isSubscribed || !endpoint) return;

        try {
          const sub = await getCurrentPushSubscription();
          if (sub) {
            const subJson = sub.toJSON();
            if (subJson.keys?.p256dh && subJson.keys?.auth) {
              await pushApi.subscribe({
                endpoint,
                keys: {
                  p256dh: subJson.keys.p256dh,
                  auth: subJson.keys.auth,
                },
                preferences,
                cycleInfo,
              });
            }
          }
        } catch {
          // 백그라운드 싱크 실패 무시
        }
      },

      sendTestPush: async (
        type: 'period' | 'fertile' | 'symptom' | 'custom' = 'period',
      ) => {
        const { endpoint, isSubscribed } = get();
        set({ isLoading: true, error: null, successMessage: null });

        if (!isSubscribed || !endpoint) {
          // 구독이 안 되어 있더라도 로컬 알림 권한이 있으면 로컬 알림으로 시연
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            const messages = {
              period: {
                title: 'Bloom 🌸',
                body: '생리 시작 2일 전이에요. 따뜻한 차 한 잔 어떠세요? 🌸',
              },
              fertile: {
                title: 'Bloom 🌱',
                body: '내일부터 가임기가 시작돼요 🌱',
              },
              symptom: {
                title: 'Bloom ✨',
                body: '오늘 하루 컨디션은 어떠셨나요? 증상을 기록해 보세요 ✨',
              },
              custom: {
                title: 'Bloom 🌸',
                body: 'Bloom 알림이 성공적으로 연결되었어요!',
              },
            };
            const msg = messages[type];
            try {
              const reg = await getSwRegistration();
              if (reg) {
                await reg.showNotification(msg.title, {
                  body: msg.body,
                  icon: '/pwa-192.png',
                  badge: '/favicon.svg',
                });
              } else {
                new Notification(msg.title, {
                  body: msg.body,
                  icon: '/pwa-192.png',
                });
              }
              set({
                isLoading: false,
                successMessage: '테스트 알림이 전송되었어요!',
              });
              return true;
            } catch {
              // 폴백 실패 시 계속
            }
          }

          set({
            isLoading: false,
            error: '먼저 알림을 켜주세요.',
          });
          return false;
        }

        try {
          await pushApi.sendTest({ endpoint, type });
          set({
            isLoading: false,
            successMessage: '테스트 알림이 전송되었어요! 상단 알림을 확인해 보세요 ✨',
          });
          return true;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : '테스트 알림 전송에 실패했어요.';
          set({ isLoading: false, error: msg });
          return false;
        }
      },

      dismissBanner: () => {
        set({ bannerDismissed: true });
      },

      clearMessages: () => {
        set({ error: null, successMessage: null });
      },
    }),
    {
      name: 'bloom-notifications',
      partialize: (state) => ({
        preferences: state.preferences,
        bannerDismissed: state.bannerDismissed,
      }),
    },
  ),
);
