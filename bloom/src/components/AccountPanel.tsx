import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, LogOut, UserRound } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCycleStore, type RemoteStatus } from '../store/cycleStore';

const SYNC_LABEL: Record<RemoteStatus, string> = {
  local: '로컬에만 저장',
  syncing: '서버 동기화 중…',
  synced: '서버에 저장됨',
  error: '동기화 실패 · 로컬에만 저장',
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
      >
        <UserRound className="h-3.5 w-3.5" />
        <span className="max-w-[140px] truncate sm:max-w-none">{user.email}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />

          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl bg-white p-4 shadow-petal ring-1 ring-primary-100/70">
            <div className="space-y-3">
              <div className="border-b border-primary-50 pb-2.5">
                <p className="text-[11px] font-medium text-gray-400">로그인 계정</p>
                <p className="truncate text-sm font-semibold text-gray-900">
                  {user.email}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className={`h-2 w-2 rounded-full ${SYNC_DOT[remoteStatus]}`} />
                <span>{SYNC_LABEL[remoteStatus]}</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary-100 px-4 py-2 text-xs font-medium text-primary-700 transition hover:bg-primary-50 active:scale-[0.99]"
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
