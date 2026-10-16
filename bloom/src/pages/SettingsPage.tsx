import { Link } from 'react-router-dom';
import { LogIn, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import NotificationSettings from '../components/NotificationSettings';
import { useAuthStore } from '../store/authStore';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* 1. 계정 정보 영역 */}
      <section className="overflow-hidden rounded-3xl border border-primary-100/70 bg-white/90 p-5 shadow-petal backdrop-blur-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100/80 text-primary-700 ring-1 ring-primary-200">
              <UserRound className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-gray-900 sm:text-lg">
                {user ? '내 계정' : '계정 로그인'}
              </h2>
              <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
                {user
                  ? user.email
                  : '로그인하시면 주기 기록이 안전하게 보관되고 웹 푸시 알림을 받을 수 있어요.'}
              </p>
            </div>
          </div>

          <div>
            {user ? (
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-xl border border-primary-100 bg-white px-3.5 py-2 text-xs font-semibold text-primary-700 shadow-sm transition hover:bg-primary-50 active:scale-[0.98]"
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

      {/* 2. 웹 푸시 알림 설정 영역 */}
      {user ? (
        <NotificationSettings />
      ) : (
        <section className="overflow-hidden rounded-3xl border border-primary-100/70 bg-gradient-to-br from-white via-primary-50/20 to-rose-50/30 p-6 shadow-petal backdrop-blur-sm sm:p-8">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100/80 px-3 py-1 text-xs font-semibold text-primary-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              로그인 전용 기능
            </span>
            <h3 className="mt-3 font-display text-lg font-bold text-gray-900 sm:text-xl">
              주요 시점 알림을 받으시려면 로그인이 필요해요 🌸
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
              소중한 일정을 놓치지 않도록, 회원님의 계정에 등록된 주기 정보를 바탕으로
              정확하고 부드러운 알림을 기기로 보내드립니다.
            </p>

            <div className="mt-4 space-y-2 rounded-2xl bg-white/80 p-4 ring-1 ring-primary-100/70">
              <p className="text-xs font-semibold text-gray-800">제공되는 부드러운 알림:</p>
              <ul className="space-y-1.5 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <span>🌸</span>
                  <span>
                    <strong>생리 시작 2일 전</strong>: &ldquo;생리 시작 2일 전이에요. 따뜻한 차 한 잔 어떠세요? 🌸&rdquo;
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🌱</span>
                  <span>
                    <strong>가임기 시작 1일 전</strong>: &ldquo;내일부터 가임기가 시작돼요 🌱&rdquo;
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span>✨</span>
                  <span>
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
      <section className="rounded-3xl border border-stone-100 bg-white/70 p-5 text-xs text-gray-500 shadow-petal">
        <h3 className="font-semibold text-gray-700">Bloom 주기 다이어리</h3>
        <p className="mt-1">
          나의 리듬을 부드럽게 따라가는 주기 다이어리 웹 앱입니다.
        </p>
        <p className="mt-2 text-[11px] text-gray-400">
          모든 계산은 사용자의 마지막 시작일과 평균 주기를 기준으로 하며, 의학적 진단을 대신하지 않습니다.
        </p>
      </section>
    </div>
  );
}
