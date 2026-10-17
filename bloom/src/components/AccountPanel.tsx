import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, LogIn, LogOut, Settings, UserRound } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

export default function AccountPanel() {
  const location = useLocation();
  const { user, ready, logout } = useAuthStore();
  const isSubscribed = useNotificationStore((state) => state.isSubscribed);
  const [open, setOpen] = useState(false);

  if (!ready) return null;

  // 비로그인 상태일 때
  if (!user) {
    if (location.pathname === '/login') return null;

    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        {location.pathname !== '/settings' && (
          <Link
            to="/settings"
            className="group flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-gray-700 shadow-petal ring-1 ring-primary-100/70 backdrop-blur transition hover:bg-white hover:text-primary-800 dark:bg-stone-900/85 dark:text-stone-300 dark:ring-stone-800 dark:hover:bg-stone-800 dark:hover:text-white active:scale-[0.98]"
            aria-label="설정"
            title="설정"
          >
            <Settings className="h-4 w-4" />
          </Link>
        )}
        <Link
          to="/login"
          className="group flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-xs font-semibold text-primary-700 shadow-petal ring-1 ring-primary-100/70 backdrop-blur transition hover:bg-white hover:text-primary-800 dark:bg-stone-900/85 dark:text-primary-400 dark:ring-stone-800 dark:hover:bg-stone-800 dark:hover:text-primary-300 active:scale-[0.98]"
          aria-label="로그인"
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>로그인</span>
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="group flex items-center gap-2 rounded-full bg-white/85 p-1.5 text-xs font-medium text-gray-700 shadow-petal ring-1 ring-primary-100/70 backdrop-blur transition hover:bg-white hover:text-gray-900 dark:bg-stone-900/85 dark:text-stone-200 dark:ring-stone-800 dark:shadow-none dark:hover:bg-stone-800 dark:hover:text-white active:scale-[0.98] sm:py-1.5 sm:pl-2 sm:pr-3"
        aria-label={`내 계정 (${user.email})`}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 ring-1 ring-primary-100 dark:bg-stone-800 dark:text-primary-400 dark:ring-stone-700">
          <UserRound className="h-3.5 w-3.5" />
        </span>
        <span className="hidden max-w-[120px] truncate text-gray-700 transition group-hover:text-gray-900 dark:text-stone-300 dark:group-hover:text-white sm:inline sm:max-w-[160px]">
          {user.email}
        </span>
        <ChevronDown
          className={`hidden h-3 w-3 text-gray-400 transition-transform duration-200 dark:text-stone-400 sm:inline ${
            open ? 'rotate-180 text-primary-600 dark:text-primary-400' : 'group-hover:text-gray-600 dark:group-hover:text-stone-200'
          }`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />

          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl bg-white/95 p-4 shadow-petal ring-1 ring-primary-100/70 backdrop-blur dark:bg-stone-900/95 dark:ring-stone-800 dark:shadow-2xl">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 border-b border-primary-50 pb-3 dark:border-stone-800">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100/80 text-primary-700 dark:bg-primary-950/80 dark:text-primary-300">
                  <UserRound className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-gray-400 dark:text-stone-500">내 계정</p>
                  <p className="truncate text-xs font-semibold text-gray-900 dark:text-stone-100" title={user.email}>
                    {user.email}
                  </p>
                </div>
              </div>

              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl bg-sand-50/80 px-3 py-2.5 text-xs text-gray-700 transition hover:bg-primary-50 hover:text-primary-800 dark:bg-stone-800/80 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary-500" />
                  <span className="font-medium">설정</span>
                </span>
                <span
                  className={`text-[11px] font-semibold ${
                    isSubscribed ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-stone-500'
                  }`}
                >
                  {isSubscribed ? '알림 켜짐' : '설정하기 →'}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary-100 bg-white px-4 py-2 text-xs font-medium text-primary-700 transition hover:bg-primary-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-750 dark:hover:text-white active:scale-[0.99]"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
