import { useState, type CSSProperties } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCycleStore } from '../store/cycleStore';
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
  const [showAverages, setShowAverages] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false,
  );

  const handleSave = () => {
    addToHistory();
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1800);
  };
  return (
    <section className="relative z-30 rounded-3xl bg-white/90 p-6 shadow-petal ring-1 ring-primary-100/70 backdrop-blur">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-primary-700">
          나의 리듬 입력
        </h2>
        <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-medium text-primary-600">
          STEP 1
        </span>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            마지막 생리 시작일
          </span>
          <DatePopover
            value={lastPeriodDate}
            onChange={setLastPeriodDate}
          />
        </label>

        <button
          type="button"
          onClick={() => setShowAverages((v) => !v)}
          className="flex w-full items-center justify-between rounded-2xl bg-sand-50/70 px-4 py-2.5 text-left text-xs font-medium text-gray-600 transition hover:bg-sand-100/70 ring-1 ring-sand-200/60"
          aria-expanded={showAverages}
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-500">평균 주기 설정</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-primary-600 shadow-xs">
              {cycleLength}일 · {periodLength}일간
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <span>{showAverages ? '접기' : '설정 변경'}</span>
            <ChevronDown
              size={15}
              strokeWidth={2.25}
              className={`transition-transform duration-200 ${showAverages ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {showAverages && (
          <div className="space-y-4 rounded-2xl border border-primary-100/60 bg-white/60 p-4 transition-all">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                평균 주기 길이:{' '}
                <span className="text-primary-600">{cycleLength}일</span>
              </span>
              <input
                type="range"
                min={21}
                max={40}
                value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value))}
                className="bloom-slider"
                style={
                  {
                    '--fill': `${((cycleLength - 21) / (40 - 21)) * 100}%`,
                  } as CSSProperties
                }
              />
              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>21일</span>
                <span>40일</span>
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                평균 생리 기간:{' '}
                <span className="text-primary-600">{periodLength}일</span>
              </span>
              <input
                type="range"
                min={2}
                max={10}
                value={periodLength}
                onChange={(e) => setPeriodLength(Number(e.target.value))}
                className="bloom-slider"
                style={
                  {
                    '--fill': `${((periodLength - 2) / (10 - 2)) * 100}%`,
                  } as CSSProperties
                }
              />
              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>2일</span>
                <span>10일</span>
              </div>
            </label>

            <button
              type="button"
              onClick={reset}
              className="w-full rounded-xl border border-primary-200/80 bg-white px-3 py-2 text-xs font-medium text-primary-700 transition hover:bg-primary-50 active:scale-[0.99]"
            >
              기본값으로 다시 시작
            </button>
          </div>
        )}

        <div className="space-y-2 pt-1">
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
        </div>
      </div>
    </section>
  );
}
