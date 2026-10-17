import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Calendar,
  ChevronDown,
  Heart,
  Lock,
  Moon,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import PhaseEmoji from '../components/PhaseEmoji';
import SymptomEmoji from '../components/SymptomEmoji';
import type { Phase } from '../data/phaseGuides';
import { SYMPTOM_IDS, SYMPTOM_BY_ID } from '../data/symptoms';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: '회원가입 없이도 모든 기능을 이용할 수 있나요?',
    answer:
      '네, 주기 계산, 캘린더 흐름 파악, 시기별 맞춤 가이드, 일별 증상 기록 등 핵심 기능은 가입 없이 브라우저(로컬 스토리지)에 바로 저장되어 무료로 이용하실 수 있습니다. 다른 기기와의 동기화 및 PWA 웹 푸시 알림이 필요하실 때만 가벼운 이메일 계정을 만드시면 됩니다.',
  },
  {
    question: '비회원으로 기록하다가 나중에 로그인하면 이전 기록이 유지되나요?',
    answer:
      '네, 안전하게 유지됩니다. 계정을 만들고 로그인하는 순간, 현재 기기의 브라우저에 저장되어 있던 모든 주기 및 증상 기록이 클라우드 서버와 자동으로 병합됩니다. 소중한 기록이 유실될 걱정 없이 안심하고 시작하세요.',
  },
  {
    question: '웹 푸시 알림은 어떻게 설정하나요?',
    answer:
      '로그인 후 상단 오른쪽 계정 메뉴 또는 하단의 [환경 설정] 탭에서 웹 푸시 알림을 켜실 수 있습니다. 생리 시작 2일 전, 가임기 시작 1일 전, 그리고 저녁 컨디션 기록 리마인더를 모바일 브라우저(PWA)나 PC로 보내드립니다.',
  },
  {
    question: '주기가 불규칙한 편인데 도움이 될까요?',
    answer:
      '불규칙한 경우에도 최근 몇 번의 평균 주기를 입력하시면 통계적 추정치로 다음 일정을 예측해 드립니다. 새로운 생리가 시작될 때마다 [오늘의 리듬] 탭에서 언제든 시작일을 갱신할 수 있으며, [이력 관리] 탭에서 지난 주기의 흐름을 비교해 보실 수 있습니다.',
  },
  {
    question: 'Bloom의 예측 결과를 피임 목적으로 사용할 수 있나요?',
    answer:
      'Bloom의 배란일 및 가임기 예측은 일반적인 생리 주기 통계 모델을 바탕으로 한 안내입니다. 스트레스, 수면 상태, 호르몬 변화에 따라 실제 배란 시점은 얼마든지 달라질 수 있으므로 의학적 진단이나 완벽한 피임의 근거로 사용하는 것은 권장하지 않습니다.',
  },
];

const PHASES: readonly { phase: Phase; label: string; desc: string }[] = [
  { phase: '생리 중', label: '월경 기간', desc: '몸을 따뜻하게 하고 충분한 휴식 취하기' },
  { phase: '여포기', label: '난포기', desc: '에너지와 활력이 서서히 차오르는 시기' },
  { phase: '배란기', label: '배란 및 가임기', desc: '임신 가능성이 가장 높은 황금기' },
  { phase: '황체기', label: '황체기 (PMS)', desc: '호르몬 변화로 컨디션 세심 케어 필요' },
];

export default function AboutPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-8">
      {/* 1. 히어로 섹션 */}
      <section className="relative overflow-hidden rounded-3xl border border-primary-100/70 bg-gradient-to-br from-white via-primary-50/25 to-rose-50/30 p-6 shadow-petal backdrop-blur-sm dark:border-stone-800 dark:from-stone-900 dark:via-stone-900/95 dark:to-stone-850 sm:p-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-100/80 px-3.5 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-200/60 dark:bg-primary-950/80 dark:text-primary-300 dark:ring-primary-800/60">
            <span>🌸</span>
            <span>Bloom 서비스 소개</span>
          </div>

          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
            나의 리듬을 부드럽게 따라가는
            <br />
            가볍고 다정한 주기 다이어리
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-stone-300 sm:text-base">
            어지러운 광고와 복잡한 가입 절차 없이, 마지막 생리 시작일과 평균 주기만 알려주세요.
            다음 생리 예정일과 배란일, 가임기를 살며시 짚어드리고 매일의 컨디션 변화를 이모지로
            편안하게 기록할 수 있도록 돕습니다.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-5 py-3 text-sm font-semibold text-white shadow-bloom transition hover:bg-primary-600 active:scale-[0.98]"
            >
              <span>오늘의 리듬 확인하기</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/symptoms"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-primary-200/70 transition hover:bg-primary-50 hover:text-primary-800 dark:bg-stone-800/90 dark:text-stone-200 dark:ring-stone-700 dark:hover:bg-stone-750 dark:hover:text-white"
            >
              <Heart className="h-4 w-4 text-primary-500" />
              <span>증상 기록해보기</span>
            </Link>
          </div>

          {/* 주요 가치 태그 */}
          <div className="mt-8 flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500 dark:text-stone-400">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 ring-1 ring-gray-200/70 dark:bg-stone-800/60 dark:ring-stone-700">
              <Sparkles className="h-3.5 w-3.5 text-primary-500" />
              가입 없이 즉시 사용
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 ring-1 ring-gray-200/70 dark:bg-stone-800/60 dark:ring-stone-700">
              <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              로컬 저장으로 안전한 프라이버시
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 ring-1 ring-gray-200/70 dark:bg-stone-800/60 dark:ring-stone-700">
              <Bell className="h-3.5 w-3.5 text-amber-500" />
              스마트 PWA 웹 푸시
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 ring-1 ring-gray-200/70 dark:bg-stone-800/60 dark:ring-stone-700">
              <Moon className="h-3.5 w-3.5 text-purple-500" />
              세심한 다크 모드
            </span>
          </div>
        </div>
      </section>

      {/* 2. 핵심 기능 4가지 안내 */}
      <section className="space-y-4">
        <div>
          <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            Bloom의 4가지 핵심 기능
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-stone-400 sm:text-sm">
            불필요한 군더더기는 덜어내고, 꼭 필요한 기능만 정성스레 담았습니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* 기능 1: 주기 예측 & 캘린더 */}
          <article className="rounded-3xl border border-primary-100/70 bg-white/90 p-5 shadow-petal backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/90 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 ring-1 ring-primary-100 dark:bg-primary-950/60 dark:text-primary-400 dark:ring-primary-900">
              <Calendar className="h-5 w-5" />
            </div>
            <h4 className="mt-4 font-display text-base font-bold text-gray-900 dark:text-white sm:text-lg">
              스마트 주기 예측 & 한눈 캘린더
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-stone-300 sm:text-sm">
              마지막 시작일과 평균 주기만 입력하면 다음 생리 예정일, 배란일, 가임기를 즉시 계산합니다.
              35일 캘린더와 D-day 안내로 내 몸의 사계절 흐름을 한눈에 조망할 수 있습니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 pt-1 border-t border-gray-100 dark:border-stone-800">
              {PHASES.map((p) => (
                <span
                  key={p.phase}
                  className="inline-flex items-center gap-1 rounded-full bg-sand-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-700 ring-1 ring-sand-200 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700"
                >
                  <PhaseEmoji phase={p.phase} className="h-3 w-3" />
                  {p.label}
                </span>
              ))}
            </div>
          </article>

          {/* 기능 2: 이모지 증상 일기 */}
          <article className="rounded-3xl border border-primary-100/70 bg-white/90 p-5 shadow-petal backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/90 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100 dark:bg-rose-950/60 dark:text-rose-400 dark:ring-rose-900">
              <Heart className="h-5 w-5" />
            </div>
            <h4 className="mt-4 font-display text-base font-bold text-gray-900 dark:text-white sm:text-lg">
              이모지로 3초 만에 남기는 증상 기록
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-stone-300 sm:text-sm">
              긴 글 작성의 번거로움 없이, 사랑스러운 Fluent UI 이모지로 오늘의 신체·감정 상태를 가볍게
              터치하여 기록합니다. 복통, 두통, 피로 등 내 컨디션 패턴을 쉽게 확인할 수 있습니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 pt-1 border-t border-gray-100 dark:border-stone-800">
              {SYMPTOM_IDS.slice(0, 6).map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full bg-sand-50 px-2 py-0.5 text-[11px] font-medium text-gray-700 ring-1 ring-sand-200 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700"
                >
                  <SymptomEmoji symptom={id} className="h-3 w-3" />
                  {SYMPTOM_BY_ID[id].label}
                </span>
              ))}
            </div>
          </article>

          {/* 기능 3: 시기별 맞춤 케어 가이드 */}
          <article className="rounded-3xl border border-primary-100/70 bg-white/90 p-5 shadow-petal backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/90 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-50 text-accent-600 ring-1 ring-accent-100 dark:bg-emerald-950/60 dark:text-accent-400 dark:ring-emerald-900">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="mt-4 font-display text-base font-bold text-gray-900 dark:text-white sm:text-lg">
              시기별 맞춤 영양 & 케어 가이드
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-stone-300 sm:text-sm">
              호르몬 주기에 맞춰 내 몸이 필요로 하는 추천 음식, 필수 영양소, 일상 준비물을 안내해
              드립니다. 또한 곁에 있는 파트너와 함께 나눌 수 있는 다정한 배려 팁을 제공합니다.
            </p>
            <div className="mt-4 flex items-center gap-2 pt-1 text-xs text-gray-500 dark:text-stone-400 border-t border-gray-100 dark:border-stone-800">
              <span className="font-medium text-accent-700 dark:text-accent-400">맞춤 큐레이션</span>
              <span>· 추천 음식, 영양제, 파트너 팁</span>
            </div>
          </article>

          {/* 기능 4: 웹 푸시 알림 */}
          <article className="rounded-3xl border border-primary-100/70 bg-white/90 p-5 shadow-petal backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/90 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100 dark:bg-amber-950/60 dark:text-amber-400 dark:ring-amber-900">
              <Bell className="h-5 w-5" />
            </div>
            <h4 className="mt-4 font-display text-base font-bold text-gray-900 dark:text-white sm:text-lg">
              놓치지 않는 스마트 웹 푸시 알림
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-stone-300 sm:text-sm">
              생리 시작 2일 전, 가임기 시작 1일 전, 컨디션 기록 리마인더를 웹 푸시로 보내 중요한 일정을
              미리 대비할 수 있도록 돕습니다. 불필요한 스팸 없이 오직 나를 위한 알림만 전송됩니다.
            </p>
            <div className="mt-4 flex items-center gap-2 pt-1 text-xs text-gray-500 dark:text-stone-400 border-t border-gray-100 dark:border-stone-800">
              <span className="font-medium text-amber-600 dark:text-amber-400">주요 알림</span>
              <span>· 생리 2일 전, 가임기 1일 전, 컨디션 기록</span>
            </div>
          </article>
        </div>
      </section>

      {/* 3. Bloom만의 세 가지 약속 */}
      <section className="rounded-3xl border border-primary-100/70 bg-white/90 p-6 shadow-petal backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/90 sm:p-8">
        <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
          Bloom이 지키는 3가지 약속
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-stone-400 sm:text-sm">
          사용자의 안심과 편안함을 가장 첫 번째 가치로 생각합니다.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100/70 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
              <Smartphone className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
              가입 없는 즉시 사용
            </h4>
            <p className="text-xs leading-relaxed text-gray-600 dark:text-stone-300">
              이메일 입력이나 가입 절차 없이, 웹사이트를 여는 즉시 브라우저에서 모든 계산과 기록을
              시작할 수 있습니다.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <RefreshCw className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
              안전한 클라우드 동기화
            </h4>
            <p className="text-xs leading-relaxed text-gray-600 dark:text-stone-300">
              계정을 연결하면 기기가 바뀌어도 기존 데이터가 안전하게 서버에 보존되며, 실시간으로
              동기화됩니다.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100/70 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
              철저한 데이터 보호
            </h4>
            <p className="text-xs leading-relaxed text-gray-600 dark:text-stone-300">
              타사 광고 추적기나 불필요한 개인정보 수집을 하지 않으며, 건강 기록을 안전하고 투명하게
              보호합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 4. 자주 묻는 질문 (FAQ) */}
      <section className="rounded-3xl border border-primary-100/70 bg-white/90 p-6 shadow-petal backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/90 sm:p-8">
        <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
          자주 묻는 질문
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-stone-400 sm:text-sm">
          Bloom을 이용하시며 궁금한 점들을 모았습니다.
        </p>

        <div className="mt-6 divide-y divide-gray-100 dark:divide-stone-800">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={item.question} className="py-3.5 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 text-left transition hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <span className="font-medium text-sm text-gray-800 dark:text-stone-200">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 dark:text-stone-500 ${
                      isOpen ? 'rotate-180 text-primary-500' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-stone-300 sm:text-sm pl-0.5">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. 시작하기 하단 배너 & 면책 고지 */}
      <section className="relative overflow-hidden rounded-3xl border border-primary-100/70 bg-gradient-to-r from-primary-500 to-rose-500 p-6 text-white shadow-bloom sm:p-8">
        <div className="relative z-10 max-w-xl">
          <h3 className="font-display text-xl font-bold sm:text-2xl">
            오늘 나의 리듬을 부드럽게 기록해 보세요 🌸
          </h3>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-rose-50">
            가입 없이 10초면 충분합니다. 마지막 시작일과 주기만 입력하고, 내 몸의 소중한 흐름과
            컨디션을 다정하게 마주해 보세요.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm transition hover:bg-rose-50 active:scale-[0.98]"
            >
              <span>지금 시작하기</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-600/50 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-600/70"
            >
              <span>환경 설정 둘러보기</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 의료 면책 안내 */}
      <footer className="rounded-2xl border border-stone-200/60 bg-white/60 p-4 text-center text-xs text-gray-500 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-400">
        <p className="leading-relaxed">
          <strong>면책 안내:</strong> Bloom의 모든 주기 예측 및 케어 가이드는 통계적 평균 모델에
          기반한 참고 정보입니다. 전문적인 의학 진단을 대신할 수 없으며, 컨디션에 이상이 있거나
          중요한 건강 문제는 반드시 전문 의료진과 상담해 주세요.
        </p>
      </footer>
    </div>
  );
}
