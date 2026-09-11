import { useState, type FormEvent } from 'react';
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
  const { user, ready, busy, error, login, signup, logout } = useAuthStore();
  const remoteStatus = useCycleStore((state) => state.remoteStatus);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!ready) return null;

  const close = () => setOpen(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      setOpen(false);
      setPassword('');
    } catch {
      // 실패 메시지는 스토어의 error 에 표시된다
    }
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-primary-700 shadow-petal ring-1 ring-primary-100/70 backdrop-blur transition hover:bg-white"
        aria-expanded={open}
      >
        <UserRound className="h-4 w-4" />
        <span>{user ? user.email : '로그인'}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} aria-hidden="true" />

          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl bg-white p-4 shadow-petal ring-1 ring-primary-100/70">
            {user ? (
              <div className="space-y-3">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {user.email}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className={`h-2 w-2 rounded-full ${SYNC_DOT[remoteStatus]}`} />
                  {SYNC_LABEL[remoteStatus]}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full border border-primary-100 px-4 py-2 text-xs font-medium text-primary-700 transition hover:bg-primary-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  로그아웃
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex rounded-full bg-primary-50 p-1 text-xs font-medium">
                  {(['login', 'signup'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`flex-1 rounded-full px-3 py-1.5 transition ${
                        mode === m
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'text-primary-700 hover:bg-primary-100/60'
                      }`}
                    >
                      {m === 'login' ? '로그인' : '회원가입'}
                    </button>
                  ))}
                </div>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium text-gray-500">
                    이메일
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-primary-100 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    placeholder="you@example.com"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium text-gray-500">
                    비밀번호
                  </span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-primary-100 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    placeholder="6자 이상"
                  />
                </label>

                {error && <p className="text-xs text-rose-600">{error}</p>}

                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full bg-primary-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-600 active:scale-[0.99] disabled:opacity-60"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  {busy ? '처리 중…' : mode === 'login' ? '로그인' : '가입하기'}
                </button>

                <p className="text-center text-[11px] leading-relaxed text-gray-400">
                  계정 없이도 사용할 수 있어요.
                  <br />
                  로그인하면 기록이 서버에 저장돼요.
                </p>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}