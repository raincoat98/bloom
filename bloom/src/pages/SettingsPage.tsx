import { Link } from 'react-router-dom';
import {
  Check,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  ShieldCheck,
  Sun,
  UserRound,
} from 'lucide-react';
import NotificationSettings from '../components/NotificationSettings';
import { useAuthStore } from '../store/authStore';
import { useThemeStore, type ThemeMode } from '../store/themeStore';

interface ThemeOption {
  id: ThemeMode;
  label: string;
  desc: string;
  icon: typeof Sun;
}

const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    id: 'system',
    label: '시스템 설정',
    desc: '기기 테마에 맞춰 자동 변경',
    icon: Monitor,
  },
  {
    id: 'light',
    label: '라이트 모드',
    desc: '화사하고 밝은 화면',
    icon: Sun,
  },
  {
    id: 'dark',
    label: '다크 모드',
    desc: '눈이 편안한 어두운 화면',
    icon: Moon,
  },
];
export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { mode, resolvedTheme, setMode } = useThemeStore();
  return (
    <div className="space-y-6">
      {/* 1. 계정 정보 영역 */}
      <section className="overflow-hidden rounded-3xl border border-primary-100/70 bg-white/90 p-4 shadow-petal backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/90 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-100/80 text-primary-700 ring-1 ring-primary-200 dark:bg-stone-800 dark:text-primary-300 dark:ring-stone-700 sm:h-12 sm:w-12">
              <UserRound className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                {user ? '내 계정' : '계정 로그인'}
              </h2>
              <p className="mt-0.5 text-xs text-gray-600 dark:text-stone-400 sm:text-sm truncate">
                {user
                  ? user.email
                  : '로그인하시면 주기 기록이 보관되고 맞춤 알림을 받을 수 있어요.'}
              </p>
            </div>
          </div>

          <div>
            {user ? (
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-xl border border-primary-100 bg-white px-3.5 py-2 text-xs font-semibold text-primary-700 shadow-sm transition hover:bg-primary-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 active:scale-[0.98]"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>로그아웃</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-600 active:scale-[0.98]"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>로그인 / 회원가입</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 2. 화면 모드 (다크 모드) 설정 영역 */}
      <section className="overflow-hidden rounded-3xl border border-primary-100/70 bg-white/90 p-4 shadow-petal backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/90 sm:p-6">
        <div className="flex items-start gap-3 sm:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-100/80 text-primary-700 ring-1 ring-primary-200/50 dark:bg-stone-800 dark:text-primary-300 dark:ring-stone-700 sm:h-11 sm:w-11">
            <Moon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="font-display text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                화면 모드
              </h2>
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700 ring-1 ring-primary-100 dark:bg-primary-950/80 dark:text-primary-300 dark:ring-1 dark:ring-primary-800/60">
                {mode === 'system'
                  ? `시스템 설정 (${resolvedTheme === 'dark' ? '다크' : '라이트'})`
                  : mode === 'dark'
                    ? '다크 모드'
                    : '라이트 모드'}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-600 dark:text-stone-400 sm:text-sm">
              기기 환경에 맞추거나 눈이 편안한 테마를 직접 선택해 보세요.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:mt-5 sm:grid-cols-3 sm:gap-3">
          {THEME_OPTIONS.map((option) => {
            const isSelected = mode === option.id;
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setMode(option.id)}
                role="radio"
                aria-checked={isSelected}
                className={`relative flex items-center gap-3 rounded-2xl p-3.5 text-left transition active:scale-[0.98] sm:flex-col sm:items-start sm:gap-3 sm:p-4 ${
                  isSelected
                    ? 'border-2 border-primary-500 bg-primary-50/70 text-primary-950 shadow-xs dark:border-primary-500 dark:bg-stone-850 dark:text-white'
                    : 'border border-stone-200/80 bg-white/80 text-stone-700 hover:border-primary-200 hover:bg-primary-50/30 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300 dark:hover:border-stone-700 dark:hover:bg-stone-850'
                }`}
              >
                <div className="flex shrink-0 items-center justify-between sm:w-full">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                      isSelected
                        ? 'bg-primary-500 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {isSelected && (
                    <span className="hidden h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white sm:flex">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{option.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-stone-400 break-keep">{option.desc}</p>
                </div>
                {isSelected && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white sm:hidden">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. 웹 푸시 알림 설정 영역 */}
      {user ? (
        <NotificationSettings />
      ) : (
        <section className="overflow-hidden rounded-3xl border border-primary-100/70 bg-gradient-to-br from-white via-primary-50/20 to-rose-50/30 p-4 shadow-petal backdrop-blur-sm dark:border-stone-800 dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-850 sm:p-8">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100/80 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-950/80 dark:text-primary-300 dark:ring-1 dark:ring-primary-800/60">
              <ShieldCheck className="h-3.5 w-3.5" />
              로그인 전용 기능
            </span>
            <h3 className="mt-3 font-display text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
              주요 시점 알림을 받으시려면 로그인이 필요해요 🌸
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-stone-300 sm:text-sm">
              소중한 일정을 놓치지 않도록, 회원님의 계정에 등록된 주기 정보를 바탕으로
              정확하고 부드러운 알림을 기기로 보내드립니다.
            </p>

            <div className="mt-4 space-y-2 rounded-2xl bg-white/80 p-4 ring-1 ring-primary-100/70 dark:bg-stone-800/80 dark:ring-stone-700">
              <p className="text-xs font-semibold text-gray-800 dark:text-stone-200">제공되는 부드러운 알림:</p>
              <ul className="space-y-1.5 text-xs text-gray-600 dark:text-stone-300">
                <li className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">🌸</span>
                  <span className="break-keep">
                    <strong>생리 시작 2일 전</strong>: &ldquo;생리 시작 2일 전이에요. 따뜻한 차 한 잔 어떠세요? 🌸&rdquo;
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">🌱</span>
                  <span className="break-keep">
                    <strong>가임기 시작 1일 전</strong>: &ldquo;내일부터 가임기가 시작돼요 🌱&rdquo;
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">✨</span>
                  <span className="break-keep">
                    <strong>컨디션 기록 리마인더</strong>: &ldquo;오늘 하루 컨디션은 어떠셨나요? 증상을 기록해 보세요 ✨&rdquo;
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600 active:scale-[0.98]"
              >
                <LogIn className="h-4 w-4" />
                <span>로그인하고 알림 받기</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3. 앱 정보 및 안내 */}
      <section className="rounded-3xl border border-stone-100 bg-white/70 p-4 text-xs text-gray-500 shadow-petal dark:border-stone-800 dark:bg-stone-900/70 dark:text-stone-400 sm:p-5">
        <h3 className="font-semibold text-gray-700 dark:text-stone-200">Bloom 주기 다이어리</h3>
        <p className="mt-1">
          나의 리듬을 부드럽게 따라가는 주기 다이어리 웹 앱입니다.
        </p>
        <p className="mt-2 text-[11px] text-gray-400 dark:text-stone-500">
          모든 계산은 사용자의 마지막 시작일과 평균 주기를 기준으로 하며, 의학적 진단을 대신하지 않습니다.
        </p>
      </section>
    </div>
  );
}
