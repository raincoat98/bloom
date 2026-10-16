import SymptomEmoji from '../components/SymptomEmoji';
import SymptomTracker from '../components/SymptomTracker';
import { SYMPTOM_BY_ID } from '../data/symptoms';
import { useSymptomStore } from '../store/symptomStore';
import { formatDate } from '../utils/cycle';

export default function SymptomsPage() {
  const logs = useSymptomStore((state) => state.logs);
  const removeLog = useSymptomStore((state) => state.removeLog);
  const recentSymptoms = logs.slice(0, 5);

  return (
    <>
      <SymptomTracker />

      <section className="relative z-20 mt-6 rounded-3xl bg-white/80 p-6 shadow-petal ring-1 ring-primary-100/70 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-primary-700">
              최근 증상
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              최근에 기록한 컨디션을 한눈에 확인해 보세요.
            </p>
          </div>
          <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-medium text-primary-600">
            {logs.length}건
          </span>
        </div>

        {recentSymptoms.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-primary-200/70 bg-primary-50/40 px-4 py-8 text-center">
            <p className="text-sm font-medium text-primary-700">
              아직 기록한 증상이 없어요
            </p>
            <p className="mt-1 text-xs text-gray-500">
              위에서 오늘의 증상을 선택하면 여기에 차곡차곡 보여드려요.
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {recentSymptoms.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-2 rounded-2xl border border-primary-100/70 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <time
                  dateTime={entry.logDate}
                  className="shrink-0 text-xs font-medium text-gray-500"
                >
                  {formatDate(new Date(`${entry.logDate}T00:00:00`))}
                </time>
                <div className="flex flex-wrap gap-1.5">
                  {(entry.symptoms ?? []).map((symptom) => (
                    <span
                      key={symptom}
                      className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-medium text-primary-700"
                    >
                      <SymptomEmoji symptom={symptom} className="h-4 w-4" />
                      {SYMPTOM_BY_ID[symptom].label}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => removeLog(entry.id)}
                  className="shrink-0 self-end rounded-full px-2 py-1 text-[11px] font-medium text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 sm:self-auto"
                  aria-label={`${formatDate(new Date(`${entry.logDate}T00:00:00`))} 증상 기록 삭제`}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
