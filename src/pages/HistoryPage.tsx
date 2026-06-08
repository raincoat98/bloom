import { useNavigate } from 'react-router-dom';
import { useCycleStore } from '../store/cycleStore';
import { formatDate } from '../utils/cycle';

export default function HistoryPage() {
  const history = useCycleStore((state) => state.history);
  const loadFromHistory = useCycleStore((state) => state.loadFromHistory);
  const removeFromHistory = useCycleStore((state) => state.removeFromHistory);
  const navigate = useNavigate();

  const handleLoad = (id: string) => {
    loadFromHistory(id);
    navigate('/');
  };

  return (
    <section className="relative z-30 rounded-3xl bg-white/90 p-6 shadow-petal ring-1 ring-primary-100/70 backdrop-blur">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-primary-700">
          저장된 주기 기록
        </h2>
        <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-medium text-primary-600">
          {history.length}건
        </span>
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary-200/70 bg-primary-50/40 p-8 text-center">
          <p className="text-sm font-medium text-primary-700">
            아직 저장된 기록이 없어요
          </p>
          <p className="mt-1 text-xs text-gray-500">
            메인 화면에서 입력값을 조정한 뒤 「계산하기」를 누르면 여기에 쌓입니다.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {history.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-3 rounded-2xl border border-primary-100/70 bg-white p-2 transition hover:border-primary-300 hover:shadow-petal"
            >
              <button
                type="button"
                onClick={() => handleLoad(entry.id)}
                className="min-w-0 flex-1 rounded-xl p-2 text-left transition hover:bg-primary-50/50 active:scale-[0.99]"
              >
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(new Date(entry.lastPeriodDate))} 시작
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  주기 {entry.cycleLength}일 · 생리 기간 {entry.periodLength}일
                </p>
                <p className="mt-1 text-[11px] text-gray-400">
                  저장일 {formatDate(new Date(entry.savedAt))}
                </p>
              </button>
              <button
                type="button"
                onClick={() => removeFromHistory(entry.id)}
                className="shrink-0 rounded-full border border-transparent px-3 py-1.5 text-xs font-medium text-gray-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                aria-label="이 기록 삭제"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
