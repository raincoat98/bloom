import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  BellRing,
  Check,
  Info,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCycleStore } from '../store/cycleStore';
import { useNotificationStore } from '../store/notificationStore';

export default function NotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    preferences,
    isLoading,
    error,
    successMessage,
    enableNotifications,
    disableNotifications,
    updatePreferences,
    clearMessages,
  } = useNotificationStore();

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { lastPeriodDate, cycleLength, periodLength } = useCycleStore();

  const cycleInfo = {
    lastPeriodDate,
    cycleLength,
    periodLength,
  };

  const handleToggleSubscribe = async () => {
    clearMessages();
    if (!user) {
      navigate('/login');
      return;
    }
    if (isSubscribed) {
      await disableNotifications();
    } else {
      await enableNotifications(cycleInfo);
    }
  };

  const handleTogglePref = (key: keyof typeof preferences) => {
    updatePreferences({ [key]: !preferences[key] }, cycleInfo);
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-primary-100/70 bg-white/90 p-4 shadow-petal backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/90 sm:p-6">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl ${
              isSubscribed
                ? 'bg-primary-50 text-primary-600 ring-2 ring-primary-200 dark:bg-primary-950/80 dark:text-primary-300 dark:ring-stone-700'
                : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
            }`}
          >
            {isSubscribed ? (
              <BellRing className="h-5 w-5 animate-bounce-subtle" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="font-display text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                주기 알림
              </h2>
              {isSubscribed ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800">
                  <Check className="h-3 w-3" />
                  켜짐
                </span>
              ) : (
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                  꺼짐
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-gray-600 dark:text-stone-400 sm:text-sm">
              주요 시점에 부드러운 알림으로 소중한 주기를 챙겨드려요 🌸
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSubscribe}
            disabled={isLoading || !isSupported}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              isSubscribed ? 'bg-primary-500' : 'bg-gray-200 dark:bg-stone-700'
            }`}
            role="switch"
            aria-checked={isSubscribed}
            aria-label="푸시 알림 켜기/끄기"
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isSubscribed ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {!user && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-primary-50/80 p-3.5 text-xs text-primary-900 ring-1 ring-primary-100 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700">
          <span className="break-keep">알림을 켜고 관리하려면 먼저 로그인해 주세요 🌸</span>
          <Link
            to="/login"
            className="shrink-0 self-start sm:self-auto rounded-xl bg-primary-500 px-3 py-1.5 font-semibold text-white shadow-sm transition hover:bg-primary-600"
          >
            로그인하기
          </Link>
        </div>
      )}

      {/* 안내 및 오류/성공 메시지 */}
      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-rose-50 p-3 text-xs text-rose-800 ring-1 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800 sm:text-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-emerald-50 p-3 text-xs text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800 sm:text-sm">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div className="flex-1">{successMessage}</div>
        </div>
      )}

      {permission === 'denied' && (
        <div className="mt-4 rounded-2xl bg-amber-50 p-3.5 text-xs text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800">
          <p className="font-semibold">⚠️ 브라우저 알림 권한이 차단되어 있어요</p>
          <p className="mt-1">
            주소창 좌측의 자물쇠/설정 아이콘을 눌러 [알림]을 &apos;허용&apos;으로 변경한 뒤
            다시 시도해 주세요.
          </p>
        </div>
      )}

      {!isSupported && (
        <div className="mt-4 rounded-2xl bg-stone-100 p-3.5 text-xs text-stone-700 dark:bg-stone-800 dark:text-stone-300">
          <p className="font-semibold">📱 모바일 Safari(iOS) 이용 팁</p>
          <p className="mt-1">
            iOS 16.4 이상에서는 Safari 하단 [공유] &gt; [홈 화면에 추가]로 앱을 설치한 후
            실행하시면 알림을 받을 수 있어요.
          </p>
        </div>
      )}

      {/* 알림 종류별 설정 */}
      <div className="mt-5 border-t border-gray-100 dark:border-stone-800 pt-5">
        <div className="space-y-3">
          {/* 1. 생리 시작 2일 전 알림 */}
          <div
            className={`flex items-start justify-between gap-3 rounded-2xl border p-3.5 transition ${
              preferences.periodBefore && isSubscribed
                ? 'border-primary-200/80 bg-primary-50/40 dark:border-primary-800/80 dark:bg-primary-950/30'
                : 'border-stone-100 bg-stone-50/60 dark:border-stone-800 dark:bg-stone-850/60 opacity-80'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-stone-100 text-sm">
                <span className="shrink-0">🌸</span>
                <span className="break-keep">생리 시작 2일 전 알림</span>
              </div>
              <p className="mt-1 text-xs text-gray-600 dark:text-stone-400 break-keep">
                &ldquo;생리 시작 2일 전이에요. 따뜻한 차 한 잔 어떠세요? 🌸&rdquo;
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePref('periodBefore')}
              disabled={!isSubscribed}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-40 ${
                preferences.periodBefore && isSubscribed
                  ? 'bg-primary-500'
                  : 'bg-gray-300 dark:bg-stone-700'
              }`}
              role="switch"
              aria-checked={preferences.periodBefore}
              aria-label="생리 시작 2일 전 알림 켜기/끄기"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.periodBefore && isSubscribed
                    ? 'translate-x-5'
                    : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. 가임기 시작 1일 전 알림 */}
          <div
            className={`flex items-start justify-between gap-3 rounded-2xl border p-3.5 transition ${
              preferences.fertileBefore && isSubscribed
                ? 'border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-800/80 dark:bg-emerald-950/30'
                : 'border-stone-100 bg-stone-50/60 dark:border-stone-800 dark:bg-stone-850/60 opacity-80'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-stone-100 text-sm">
                <span className="shrink-0">🌱</span>
                <span className="break-keep">가임기 시작 1일 전 알림</span>
              </div>
              <p className="mt-1 text-xs text-gray-600 dark:text-stone-400 break-keep">
                &ldquo;내일부터 가임기가 시작돼요 🌱&rdquo;
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePref('fertileBefore')}
              disabled={!isSubscribed}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-40 ${
                preferences.fertileBefore && isSubscribed
                  ? 'bg-emerald-500'
                  : 'bg-gray-300 dark:bg-stone-700'
              }`}
              role="switch"
              aria-checked={preferences.fertileBefore}
              aria-label="가임기 시작 1일 전 알림 켜기/끄기"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.fertileBefore && isSubscribed
                    ? 'translate-x-5'
                    : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. 오늘 컨디션 및 증상 기록 리마인더 */}
          <div
            className={`flex items-start justify-between gap-3 rounded-2xl border p-3.5 transition ${
              preferences.symptomReminder && isSubscribed
                ? 'border-amber-200/80 bg-amber-50/40 dark:border-amber-800/80 dark:bg-amber-950/30'
                : 'border-stone-100 bg-stone-50/60 dark:border-stone-800 dark:bg-stone-850/60 opacity-80'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-stone-100 text-sm">
                <span className="shrink-0">✨</span>
                <span className="break-keep">컨디션 및 증상 기록 리마인더</span>
              </div>
              <p className="mt-1 text-xs text-gray-600 dark:text-stone-400 break-keep">
                &ldquo;오늘 하루 컨디션은 어떠셨나요? 증상을 기록해 보세요 ✨&rdquo;
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePref('symptomReminder')}
              disabled={!isSubscribed}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-40 ${
                preferences.symptomReminder && isSubscribed
                  ? 'bg-amber-500'
                  : 'bg-gray-300 dark:bg-stone-700'
              }`}
              role="switch"
              aria-checked={preferences.symptomReminder}
              aria-label="컨디션 및 증상 기록 리마인더 켜기/끄기"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.symptomReminder && isSubscribed
                    ? 'translate-x-5'
                    : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
