import { BellRing, X } from 'lucide-react';
import { useCycleStore } from '../store/cycleStore';
import { useNotificationStore } from '../store/notificationStore';

export default function NotificationBanner() {
  const {
    isSubscribed,
    bannerDismissed,
    isSupported,
    permission,
    isLoading,
    enableNotifications,
    dismissBanner,
  } = useNotificationStore();

  const { lastPeriodDate, cycleLength, periodLength } = useCycleStore();

  if (isSubscribed || bannerDismissed || !isSupported || permission === 'denied') {
    return null;
  }

  const handleEnable = async () => {
    await enableNotifications({
      lastPeriodDate,
      cycleLength,
      periodLength,
    });
  };

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-primary-50 via-rose-50 to-amber-50 p-4 shadow-sm ring-1 ring-primary-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary-500 shadow-sm ring-1 ring-primary-100">
            <BellRing className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              주기 알림을 켜두고 편안하게 하루를 보내세요 🌸
            </h3>
            <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
              생리 예정 2일 전, 가임기 시작 1일 전, 컨디션 기록 리마인더를 부드럽게 전해드려요.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleEnable}
                disabled={isLoading}
                className="rounded-xl bg-primary-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-600 disabled:opacity-50"
              >
                알림 받기
              </button>
              <button
                type="button"
                onClick={dismissBanner}
                className="rounded-xl px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-white/60"
              >
                나중에
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={dismissBanner}
          className="rounded-lg p-1 text-gray-400 hover:bg-white/60 hover:text-gray-600"
          aria-label="알림 배너 닫기"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
