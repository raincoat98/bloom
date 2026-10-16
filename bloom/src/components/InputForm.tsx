import { useState } from 'react';
import { ChevronDown, Minus, Plus } from 'lucide-react';
import { useCycleStore } from '../store/cycleStore';
import { formatShortDate } from '../utils/cycle';
import DatePopover from './DatePopover';
export default function InputForm() {
  const {
    lastPeriodDate,
    cycleLength,
    periodLength,
    setLastPeriodDate,
    setCycleLength,
    setPeriodLength,
    reset,
    addToHistory,
  } = useCycleStore();
  const [savedFlash, setSavedFlash] = useState(false);
  const [isExpanded, setIsExpanded] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  );

  const handleSave = () => {
    addToHistory();
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1800);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsExpanded(false);
    }
  };

  return (
    <section className="relative z-30 rounded-3xl bg-white/90 p-5 shadow-petal ring-1 ring-primary-100/70 backdrop-blur transition-all sm:p-6">
      <div
        className="flex cursor-pointer items-center justify-between gap-3 select-none"
        onClick={() => setIsExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded((v) => !v);
          }
        }}
        aria-expanded={isExpanded}
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-primary-700">
              나의 리듬 설정
            </h2>
            <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-medium text-primary-600">
              STEP 1
            </span>
          </div>
          {!isExpanded && (
            <p className="mt-1 text-xs text-gray-500">
              {lastPeriodDate ? `${formatShortDate(new Date(lastPeriodDate))} 시작 · ` : ''}
              평균 주기 {cycleLength}일 · 기간 {periodLength}일
            </p>
          )}
        </div>

        <button
          type="button"
          aria-expanded={isExpanded}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-100/70"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded((v) => !v);
          }}
        >
          <span>{isExpanded ? '접기' : '수정하기'}</span>
          <ChevronDown
            size={16}
            strokeWidth={2.25}
            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {isExpanded && (
        <div className="mt-5 space-y-4 border-t border-primary-100/50 pt-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              마지막 생리 시작일
            </span>
            <DatePopover value={lastPeriodDate} onChange={setLastPeriodDate} />
          </label>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">평균 주기 길이</span>
              <span className="text-xs font-semibold text-primary-600">
                {cycleLength}일 주기
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-sand-50/80 p-2 ring-1 ring-sand-200/70">
              <button
                type="button"
                onClick={() => setCycleLength(Math.max(21, cycleLength - 1))}
                disabled={cycleLength <= 21}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 shadow-xs ring-1 ring-black/5 transition hover:bg-primary-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="주기 1일 줄이기"
              >
                <Minus size={18} strokeWidth={2.25} />
              </button>
              <div className="text-center">
                <span className="font-display text-xl font-bold text-gray-900">{cycleLength}</span>
                <span className="ml-1 text-xs font-medium text-gray-500">일</span>
              </div>
              <button
                type="button"
                onClick={() => setCycleLength(Math.min(40, cycleLength + 1))}
                disabled={cycleLength >= 40}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 shadow-xs ring-1 ring-black/5 transition hover:bg-primary-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="주기 1일 늘리기"
              >
                <Plus size={18} strokeWidth={2.25} />
              </button>
            </div>
            <div className="mt-1.5 flex justify-between px-1 text-[11px] text-gray-400">
              <span>최소 21일</span>
              <span>일반적 28일</span>
              <span>최대 40일</span>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">평균 생리 기간</span>
              <span className="text-xs font-semibold text-primary-600">
                {periodLength}일간 지속
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-sand-50/80 p-2 ring-1 ring-sand-200/70">
              <button
                type="button"
                onClick={() => setPeriodLength(Math.max(2, periodLength - 1))}
                disabled={periodLength <= 2}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 shadow-xs ring-1 ring-black/5 transition hover:bg-primary-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="생리 기간 1일 줄이기"
              >
                <Minus size={18} strokeWidth={2.25} />
              </button>
              <div className="text-center">
                <span className="font-display text-xl font-bold text-gray-900">{periodLength}</span>
                <span className="ml-1 text-xs font-medium text-gray-500">일</span>
              </div>
              <button
                type="button"
                onClick={() => setPeriodLength(Math.min(10, periodLength + 1))}
                disabled={periodLength >= 10}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 shadow-xs ring-1 ring-black/5 transition hover:bg-primary-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="생리 기간 1일 늘리기"
              >
                <Plus size={18} strokeWidth={2.25} />
              </button>
            </div>
            <div className="mt-1.5 flex justify-between px-1 text-[11px] text-gray-400">
              <span>최소 2일</span>
              <span>일반적 5일</span>
              <span>최대 10일</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="w-full rounded-xl bg-gradient-to-br from-primary-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-petal transition hover:brightness-105 active:scale-[0.99]"
            >
              계산하기
            </button>
            {savedFlash && (
              <p className="text-center text-xs text-primary-600">
                이력에 저장되었어요
              </p>
            )}
            <button
              type="button"
              onClick={reset}
              className="w-full rounded-xl border border-primary-200 px-4 py-2.5 text-sm font-medium text-primary-700 transition hover:bg-primary-50 active:scale-[0.99]"
            >
              기본값으로 다시 시작
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
