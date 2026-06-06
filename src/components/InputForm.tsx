import { useCycleStore } from '../store/cycleStore';

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
    <section className="rounded-3xl bg-white/90 p-6 shadow-petal ring-1 ring-primary-100/70 backdrop-blur">
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
          <input
            type="date"
            value={lastPeriodDate}
            onChange={(e) => setLastPeriodDate(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            평균 주기 길이:{' '}
            <span className="text-primary-600">{cycleLength}일</span>
          </span>
          <input
            type="range"
            min={21}
            max={40}
            value={cycleLength}
            onChange={(e) => setCycleLength(Number(e.target.value))}
            className="w-full accent-primary-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>21일</span>
            <span>40일</span>
          </div>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            평균 생리 기간:{' '}
            <span className="text-primary-600">{periodLength}일</span>
          </span>
          <input
            type="range"
            min={2}
            max={10}
            value={periodLength}
            onChange={(e) => setPeriodLength(Number(e.target.value))}
            className="w-full accent-primary-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
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
