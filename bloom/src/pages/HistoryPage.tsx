import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCycleStore, type CycleHistoryEntry } from '../store/cycleStore';
import { formatDate } from '../utils/cycle';
export default function HistoryPage() {
  const history = useCycleStore((state) => state.history);
  const loadFromHistory = useCycleStore((state) => state.loadFromHistory);
  const removeFromHistory = useCycleStore((state) => state.removeFromHistory);
  const isLoggedIn = useAuthStore((state) => Boolean(state.user));
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<CycleHistoryEntry | null>(null);

  const handleLoad = (id: string) => {
    loadFromHistory(id);
    navigate('/');
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    removeFromHistory(deleteTarget.id);
    setDeleteTarget(null);
  };

  useEffect(() => {
    if (!deleteTarget) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDeleteTarget(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteTarget]);

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

      {isLoggedIn && (
        <p className="-mt-2 mb-3 text-[11px] text-gray-400">
          로그인 상태라서 이 기록들은 서버에도 저장돼요.
        </p>
      )}
      {!isLoggedIn && history.length > 0 && (
        <div className="-mt-2 mb-4 flex items-center justify-between rounded-2xl bg-primary-50/70 px-3.5 py-2.5 text-xs text-primary-900">
          <span>기록을 잃어버리지 않게 서버에 동기화할 수 있어요.</span>
          <Link
            to="/login"
            state={{ from: '/history' }}
            className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800"
          >
            로그인하기
          </Link>
        </div>
      )}
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
                  주기 {entry.cycleLength}일, 생리 기간 {entry.periodLength}일
                </p>
                <p className="mt-1 text-[11px] text-gray-400">
                  저장일 {formatDate(new Date(entry.savedAt))}
                </p>
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(entry)}
                className="shrink-0 rounded-full border border-transparent px-3 py-1.5 text-xs font-medium text-gray-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                aria-label={`${formatDate(new Date(entry.lastPeriodDate))} 주기 기록 삭제`}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
      {deleteTarget && (
        <div
          role="presentation"
          onClick={() => setDeleteTarget(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs transition-opacity"
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-desc"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-bloom ring-1 ring-primary-100/70"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 ring-1 ring-rose-100">
              <Trash2 size={22} strokeWidth={2.25} />
            </div>

            <h3
              id="delete-dialog-title"
              className="mt-4 font-display text-lg font-bold text-gray-900"
            >
              주기 기록을 삭제할까요?
            </h3>

            <p id="delete-dialog-desc" className="mt-2 text-sm text-gray-600 leading-relaxed">
              <strong className="font-semibold text-gray-900">
                {formatDate(new Date(deleteTarget.lastPeriodDate))}
              </strong>{' '}
              시작 기록(주기 {deleteTarget.cycleLength}일, 기간 {deleteTarget.periodLength}일)이 목록에서 완전히 삭제됩니다.
            </p>
            <p className="mt-1 text-xs text-rose-500">
              삭제한 기록은 다시 복구할 수 없어요.
            </p>

            <div className="mt-6 flex gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 active:scale-[0.98]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 active:scale-[0.98]"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
