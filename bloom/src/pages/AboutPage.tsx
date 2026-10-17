import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Calendar,
  ChevronDown,
  Heart,
  Smartphone,
  Smile,
  Sparkles,
  Zap,
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
    question: '정말 회원가입 없이 그냥 써도 되나요?',
    answer:
      '네, 맞아요! 사이트에 접속하자마자 다음 생리일 계산부터 한 달 캘린더 확인, 이모지 증상 기록까지 모든 기능을 즉시 무료로 이용하실 수 있습니다. 다른 스마트폰이나 PC에서도 기록을 함께 관리하고 싶을 때만 가볍게 계정을 연동해 두시면 됩니다.',
  },
  {
    question: '앱스토어에서 앱을 따로 다운로드받아야 하나요?',
    answer:
      '아니요, 따로 앱을 설치할 필요가 없습니다. 모바일 브라우저(사파리, 크롬 등)에서 [홈 화면에 추가]만 해두시면 앱처럼 아이콘 하나로 터치해 언제든 빠르게 들어오실 수 있습니다.',
  },
  {
    question: '생리 주기가 매달 달라지는데 잘 맞을까요?',
    answer:
      '주기가 조금 불규칙하더라도 평소 평균 주기를 바탕으로 가장 유력한 시점을 안내해 드립니다. 새로운 생리가 시작되었을 때 시작일만 다시 선택해 주시면 즉시 다음 예정일과 가임기가 새로 계산됩니다. 이전 주기는 [이력 관리] 탭에서 편하게 비교해 보실 수 있습니다.',
  },
  {
    question: '다가오는 일정을 잊지 않도록 알림을 받을 수 있나요?',
    answer:
      '네, 로그인 후 환경 설정에서 알림을 켜시면 생리 시작 2일 전, 가임기 시작 1일 전에 잊지 않고 챙길 수 있도록 미리 조용히 알려드립니다.',
  },
  {
    question: '배란일이나 가임기 예측을 피임에 그대로 믿어도 되나요?',
    answer:
      'Bloom의 계산은 일반적인 주기 모델에 기반한 안내 지표입니다. 수면 상태나 스트레스, 컨디션에 따라 배란 시점은 얼마든지 달라질 수 있으므로 의학적 진단이나 확실한 피임 목적으로 맹신하기보다는 내 몸을 살피는 건강 관리 참고용으로 활용해 주세요.',
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
    <div className="space-y-10">
      {/* 1. 히어로 섹션 */}
      <section className="relative overflow-hidden rounded-3xl border border-primary-100/70 bg-gradient-to-br from-white via-primary-50/25 to-rose-50/30 p-6 shadow-petal backdrop-blur-sm dark:border-stone-800 dark:from-stone-900 dark:via-stone-900/95 dark:to-stone-850 sm:p-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-100/80 px-3.5 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-200/60 dark:bg-primary-950/80 dark:text-primary-300 dark:ring-primary-800/60">
            <span>🌸</span>
            <span>Bloom 서비스 소개</span>
          </div>

          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-gray-900 break-keep dark:text-white sm:text-3xl lg:text-4xl">
            설치도, 가입도 필요 없이
            <br />
            언제 어디서나 가볍게 여는 주기 다이어리
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-gray-600 break-keep dark:text-stone-300 sm:text-base sm:leading-7">
            복잡한 설정이나 번거로운 절차는 모두 덜어냈어요.
            웹 브라우저에서 바로 열고 날짜만 콕 찍으면,
            다음 생리 예정일과 가임기, 그리고 오늘의 컨디션 흐름을 편안하게 확인할 수 있습니다.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
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

          {/* 간편한 접근성 태그 */}
          <div className="mt-8 flex flex-wrap items-center gap-2.5 text-xs font-medium text-gray-500 dark:text-stone-400">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 ring-1 ring-gray-200/70 dark:bg-stone-800/60 dark:ring-stone-700">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              앱 설치 없이 바로 열기
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 ring-1 ring-gray-200/70 dark:bg-stone-800/60 dark:ring-stone-700">
              <Sparkles className="h-3.5 w-3.5 text-primary-500" />
              가입 절차 없이 3초 시작
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 ring-1 ring-gray-200/70 dark:bg-stone-800/60 dark:ring-stone-700">
              <Heart className="h-3.5 w-3.5 text-rose-500" />
              이모지로 3초 기록
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 ring-1 ring-gray-200/70 dark:bg-stone-800/60 dark:ring-stone-700">
              <Smartphone className="h-3.5 w-3.5 text-rose-500" />
              스마트폰·PC 어디서나
            </span>
          </div>
        </div>
      </section>

      {/* 2. 핵심 기능 4가지 안내 */}
      <section className="space-y-5">
        <div>
          <h3 className="font-display text-xl font-bold text-gray-900 break-keep dark:text-white sm:text-2xl">
            누구나 쉽게 쓰는 Bloom의 핵심 기능
          </h3>
          <p className="mt-1.5 text-xs text-gray-500 break-keep dark:text-stone-400 sm:text-sm">
            처음 쓰는 분도 헤매지 않도록 가장 직관적인 경험을 드립니다.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* 기능 1: 주기 예측 & 캘린더 */}
          <article className="flex flex-col justify-between rounded-3xl border border-primary-100/70 bg-white/90 p-6 shadow-petal backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/90 sm:p-7">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 ring-1 ring-primary-100 dark:bg-primary-950/60 dark:text-primary-400 dark:ring-primary-900">
                <Calendar className="h-5 w-5" />
              </div>
              <h4 className="mt-5 font-display text-base font-bold text-gray-900 break-keep dark:text-white sm:text-lg">
                날짜만 콕 찍으면 끝나는 주기 예측 & 캘린더
              </h4>
              <p className="mt-3 text-xs leading-6 text-gray-600 break-keep dark:text-stone-300 sm:text-sm sm:leading-6">
                마지막 생리일과 주기만 가볍게 선택하세요. 다음 생리일, 배란일, 임신 가능성이 높은 가임기까지
                한 달 캘린더 위에 한눈에 보기 쉽게 펼쳐드립니다.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-stone-800">
              {PHASES.map((p) => (
                <span
                  key={p.phase}
                  className="inline-flex items-center gap-1.5 rounded-full bg-sand-50 px-2.5 py-1 text-[11px] font-medium text-gray-700 ring-1 ring-sand-200 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700"
                >
                  <PhaseEmoji phase={p.phase} className="h-3.5 w-3.5" />
                  {p.label}
                </span>
              ))}
            </div>
          </article>

          {/* 기능 2: 이모지 증상 일기 */}
          <article className="flex flex-col justify-between rounded-3xl border border-primary-100/70 bg-white/90 p-6 shadow-petal backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/90 sm:p-7">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100 dark:bg-rose-950/60 dark:text-rose-400 dark:ring-rose-900">
                <Heart className="h-5 w-5" />
              </div>
              <h4 className="mt-5 font-display text-base font-bold text-gray-900 break-keep dark:text-white sm:text-lg">
                글 쓸 필요 없이 터치 한 번, 이모지 기록
              </h4>
              <p className="mt-3 text-xs leading-6 text-gray-600 break-keep dark:text-stone-300 sm:text-sm sm:leading-6">
                몸이 무겁고 피곤한 날, 긴 글을 쓸 필요가 없어요. 복통, 두통, 피로, 기분 변화 등 오늘의
                컨디션을 귀여운 이모지로 가볍게 콕 눌러 3초 만에 남겨보세요.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-stone-800">
              {SYMPTOM_IDS.slice(0, 6).map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full bg-sand-50 px-2.5 py-1 text-[11px] font-medium text-gray-700 ring-1 ring-sand-200 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700"
                >
                  <SymptomEmoji symptom={id} className="h-3.5 w-3.5" />
                  {SYMPTOM_BY_ID[id].label}
                </span>
              ))}
            </div>
          </article>

          {/* 기능 3: 시기별 맞춤 케어 가이드 */}
          <article className="flex flex-col justify-between rounded-3xl border border-primary-100/70 bg-white/90 p-6 shadow-petal backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/90 sm:p-7">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-50 text-accent-600 ring-1 ring-accent-100 dark:bg-emerald-950/60 dark:text-accent-400 dark:ring-emerald-900">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="mt-5 font-display text-base font-bold text-gray-900 break-keep dark:text-white sm:text-lg">
                내 몸의 시기에 맞춘 다정한 케어 가이드
              </h4>
              <p className="mt-3 text-xs leading-6 text-gray-600 break-keep dark:text-stone-300 sm:text-sm sm:leading-6">
                호르몬 변화로 지치기 쉬운 시기마다 몸을 편안하게 해주는 따뜻한 음식, 챙겨 먹으면 좋은 영양소,
                그리고 곁에 있는 파트너와 나눌 수 있는 다정한 배려 팁을 전해드려요.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500 dark:border-stone-800 dark:text-stone-400">
              <span className="font-medium text-accent-700 dark:text-accent-400">맞춤 조언</span>
              <span>· 추천 음식, 영양소, 파트너 팁</span>
            </div>
          </article>

          {/* 기능 4: 사전 리마인더 알림 */}
          <article className="flex flex-col justify-between rounded-3xl border border-primary-100/70 bg-white/90 p-6 shadow-petal backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/90 sm:p-7">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100 dark:bg-amber-950/60 dark:text-amber-400 dark:ring-amber-900">
                <Bell className="h-5 w-5" />
              </div>
              <h4 className="mt-5 font-display text-base font-bold text-gray-900 break-keep dark:text-white sm:text-lg">
                중요한 날을 미리 챙겨주는 조용한 알림
              </h4>
              <p className="mt-3 text-xs leading-6 text-gray-600 break-keep dark:text-stone-300 sm:text-sm sm:leading-6">
                생리 시작 2일 전, 가임기 시작 1일 전에 잊지 않고 준비할 수 있도록 미리 알려드려요.
                불필요한 스팸 알림 없이 꼭 필요한 주기 일정만 조용히 전해집니다.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500 dark:border-stone-800 dark:text-stone-400">
              <span className="font-medium text-amber-600 dark:text-amber-400">사전 안내</span>
              <span>· 생리 2일 전, 가임기 1일 전, 컨디션 기록</span>
            </div>
          </article>
        </div>
      </section>

      {/* 3. 편안하게 쓸 수 있는 이유 */}
      <section className="rounded-3xl border border-primary-100/70 bg-white/90 p-6 shadow-petal backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/90 sm:p-8">
        <h3 className="font-display text-xl font-bold text-gray-900 break-keep dark:text-white sm:text-2xl">
          Bloom을 마음 편히 쓸 수 있는 이유
        </h3>
        <p className="mt-1.5 text-xs text-gray-500 break-keep dark:text-stone-400 sm:text-sm">
          사용자를 피곤하게 만드는 모든 방해 요소를 없앴습니다.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100/70 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
              <Zap className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-gray-900 break-keep dark:text-white text-sm sm:text-base">
              앱 설치 없는 간편함
            </h4>
            <p className="text-xs leading-6 text-gray-600 break-keep dark:text-stone-300 sm:text-sm">
              앱스토어에서 앱을 찾고 용량을 차지할 필요가 없어요. 브라우저에서 바로 열고 언제든 편하게 확인하세요.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-gray-900 break-keep dark:text-white text-sm sm:text-base">
              첫 화면부터 즉시 사용
            </h4>
            <p className="text-xs leading-6 text-gray-600 break-keep dark:text-stone-300 sm:text-sm">
              접속하자마자 회원가입 창 대신 주기 입력 화면이 먼저 반겨줍니다. 기다림 없이 바로 시작하세요.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100/70 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <Smile className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-gray-900 break-keep dark:text-white text-sm sm:text-base">
              설명서 없이 바로 쓰는 사용법
            </h4>
            <p className="text-xs leading-6 text-gray-600 break-keep dark:text-stone-300 sm:text-sm">
              복잡한 매뉴얼을 익힐 필요가 없어요. 날짜를 누르고 이모지를 콕 선택하는 것만으로 누구나 첫눈에 바로 쓸 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 4. 자주 묻는 질문 (FAQ) */}
      <section className="rounded-3xl border border-primary-100/70 bg-white/90 p-6 shadow-petal backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/90 sm:p-8">
        <h3 className="font-display text-xl font-bold text-gray-900 break-keep dark:text-white sm:text-2xl">
          자주 묻는 질문
        </h3>
        <p className="mt-1.5 text-xs text-gray-500 break-keep dark:text-stone-400 sm:text-sm">
          처음 시작하시는 분들이 자주 궁금해하시는 내용이에요.
        </p>

        <div className="mt-6 divide-y divide-gray-100 dark:divide-stone-800">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={item.question} className="py-4 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 text-left transition hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <span className="font-medium text-sm text-gray-800 break-keep dark:text-stone-200">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 dark:text-stone-500 ${
                      isOpen ? 'rotate-180 text-primary-500' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-xs leading-relaxed text-gray-600 break-keep dark:text-stone-300 sm:text-sm sm:leading-6 pl-0.5">
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
          <h3 className="font-display text-xl font-bold break-keep sm:text-2xl">
            오늘 나의 리듬을 부드럽게 기록해 보세요 🌸
          </h3>
          <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-rose-50 break-keep sm:leading-6">
            날짜 선택 하나면 충분합니다. 마지막 시작일과 주기만 누르고, 내 몸의 소중한 흐름과
            컨디션을 다정하게 마주해 보세요.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm transition hover:bg-rose-50 active:scale-[0.98]"
            >
              <span>지금 시작하기</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/symptoms"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-600/50 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-600/70"
            >
              <span>증상 기록 체험</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 의료 면책 안내 */}
      <footer className="rounded-2xl border border-stone-200/60 bg-white/60 p-4 text-center text-xs text-gray-500 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-400">
        <p className="leading-relaxed break-keep">
          <strong>면책 안내:</strong> Bloom의 모든 주기 예측 및 케어 가이드는 통계적 평균 모델에
          기반한 참고 정보입니다. 전문적인 의학 진단을 대신할 수 없으며, 컨디션에 이상이 있거나
          건강에 대한 염려가 있을 때는 전문 의료진과 상담해 주세요.
        </p>
      </footer>
    </div>
  );
}
