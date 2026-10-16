import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, LogIn, LogOut, UserRound } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCycleStore, type RemoteStatus } from '../store/cycleStore';
import { useNotificationStore } from '../store/notificationStore';
const SYNC_LABEL: Record<RemoteStatus, string> = {
  local: '로컬에만 저장',
  syncing: '서버 동기화 중…',
  synced: '서버에 저장됨',
  error: '동기화 실패 (로컬에만 저장)',
};

const SYNC_DOT: Record<RemoteStatus, string> = {
  local: 'bg-gray-300',
  syncing: 'bg-amber-400 animate-pulse',
  synced: 'bg-emerald-500',
  error: 'bg-rose-500',
};

export default function AccountPanel() {
  const location = useLocation();
  const { user, ready, logout } = useAuthStore();
  const remoteStatus = useCycleStore((state) => state.remoteStatus);
  const isSubscribed = useNotificationStore((state) => state.isSubscribed);
  const [open, setOpen] = useState(false);
  if (!ready) return null;

  // 비로그인 상태일 때
  if (!user) {
    if (location.pathname === '/login') return null;

    return (
      <Link
        to="/login"
        state={{ from: location.pathname }}
        className="flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1.5 text-xs font-medium text-primary-700 shadow-petal ring-1 ring-primary-100/70 backdrop-blur transition hover:bg-white active:scale-[0.98]"
      >
        <LogIn className="h-3.5 w-3.5" />
        <span>로그인</span>
      </Link>
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
        className="group flex items-center gap-2 rounded-full bg-white/85 p-1.5 text-xs font-medium text-gray-700 shadow-petal ring-1 ring-primary-100/70 backdrop-blur transition hover:bg-white hover:text-gray-900 active:scale-[0.98] sm:py-1.5 sm:pl-2 sm:pr-3"
        aria-label={`내 계정 (${user.email})`}
      >
        <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 ring-1 ring-primary-100">
          <UserRound className="h-3.5 w-3.5" />
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-white ${SYNC_DOT[remoteStatus]}`}
          />
        </span>
        <span className="hidden max-w-[120px] truncate text-gray-700 transition group-hover:text-gray-900 sm:inline sm:max-w-[160px]">
          {user.email}
        </span>
        <ChevronDown
          className={`hidden h-3 w-3 text-gray-400 transition-transform duration-200 sm:inline ${
            open ? 'rotate-180 text-primary-600' : 'group-hover:text-gray-600'
          }`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />

          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl bg-white/95 p-4 shadow-petal ring-1 ring-primary-100/70 backdrop-blur">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 border-b border-primary-50 pb-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100/80 text-primary-700">
                  <UserRound className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-gray-400">내 계정</p>
                  <p className="truncate text-xs font-semibold text-gray-900" title={user.email}>
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-sand-50/80 px-2.5 py-2 text-xs text-gray-600">
                <span className={`h-2 w-2 shrink-0 rounded-full ${SYNC_DOT[remoteStatus]}`} />
                <span>{SYNC_LABEL[remoteStatus]}</span>
              </div>

              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl bg-sand-50/80 px-2.5 py-2 text-xs text-gray-600 transition hover:bg-primary-50 hover:text-primary-800"
              >
                <span className="flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 text-primary-500" />
                  <span>알림 및 설정</span>
                </span>
                <span
                  className={`font-semibold ${
                    isSubscribed ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                >
                  {isSubscribed ? '알림 켜짐' : '설정하기 →'}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary-100 bg-white px-4 py-2 text-xs font-medium text-primary-700 transition hover:bg-primary-50 active:scale-[0.99]"
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
