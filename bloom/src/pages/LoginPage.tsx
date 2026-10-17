import { useState, useEffect, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, busy, login, signup } = useAuthStore();

  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from || searchParams.get('redirect') || '/';

  // 이미 로그인된 경우 원래 페이지로 이동
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : '요청 처리에 실패했어요.');
    }
  };

  const handleModeChange = (nextMode: 'login' | 'signup') => {
    setMode(nextMode);
    setLocalError(null);
  };

  return (
    <section className="mx-auto w-full max-w-md">
      <div className="relative z-30 rounded-3xl bg-white/90 p-6 shadow-petal ring-1 ring-primary-100/70 backdrop-blur dark:bg-stone-900/90 dark:ring-stone-800 dark:shadow-none sm:p-8">
        <div className="mb-6 flex rounded-full bg-primary-50/80 p-1 text-sm font-medium dark:bg-stone-800">
          <button
            type="button"
            onClick={() => handleModeChange('login')}
            className={`flex-1 rounded-full py-2 text-center transition ${
              mode === 'login'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-primary-700 hover:bg-primary-100/60 dark:text-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('signup')}
            className={`flex-1 rounded-full py-2 text-center transition ${
              mode === 'signup'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-primary-700 hover:bg-primary-100/60 dark:text-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            회원가입
          </button>
        </div>

        <div className="mb-6 text-center">
          <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
            {mode === 'login' ? '다시 오신 것을 환영해요' : '새 계정 만들기'}
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-stone-400">
            {mode === 'login'
              ? '로그인하고 동기화된 주기 기록을 확인하세요'
              : '간단히 가입하고 소중한 기록을 안전하게 보관하세요'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-stone-300">
              이메일
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (localError) setLocalError(null);
              }}
              className="w-full rounded-2xl border border-primary-100 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-300 focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50 dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:placeholder:text-stone-500 dark:focus:ring-primary-900/40 sm:text-sm"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="block text-xs font-medium text-gray-600 dark:text-stone-300">
                비밀번호
              </span>
              <span className="text-[11px] text-gray-400 dark:text-stone-500">6자 이상</span>
            </div>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (localError) setLocalError(null);
              }}
              className="w-full rounded-2xl border border-primary-100 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-300 focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50 dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:placeholder:text-stone-500 dark:focus:ring-primary-900/40 sm:text-sm"
              placeholder="비밀번호를 입력해 주세요"
            />
          </label>

          {localError && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 px-3.5 py-2.5 text-xs text-rose-600 ring-1 ring-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-900/60">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{localError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 py-3.5 text-sm font-semibold text-white shadow-petal transition hover:bg-primary-600 active:scale-[0.99] disabled:opacity-60"
          >
            {mode === 'login' ? (
              <LogIn className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            <span>
              {busy ? '처리 중…' : mode === 'login' ? '로그인하기' : '가입하기'}
            </span>
          </button>

          <div className="rounded-2xl bg-primary-50/50 p-4 text-center text-xs leading-relaxed text-gray-600 dark:bg-stone-800/60 dark:text-stone-300">
            <p className="font-medium text-primary-800 dark:text-primary-300">
              계정 없이도 사용할 수 있어요.
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400 dark:text-stone-500">
              로그인하면 입력한 기록이 서버에 안전하게 보관돼요.
            </p>
          </div>

          <div className="pt-2 text-center">
            <Link
              to={from}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-primary-700 dark:text-stone-400 dark:hover:text-primary-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>돌아가기</span>
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
