import type { CSSProperties } from 'react';
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
  } = useCycleStore();

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
          className="w-full rounded-xl border border-primary-200 px-4 py-2.5 text-sm font-medium text-primary-700 transition hover:bg-primary-50 active:scale-[0.99]"
        >
          기본값으로 다시 시작
        </button>
      </div>
    </section>
  );
}
