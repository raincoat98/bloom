import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Check, Sparkles, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCycleStore, type CycleHistoryEntry } from '../store/cycleStore';
import { calculateCycleStats, formatDate, parseLocalDate } from '../utils/cycle';

export default function HistoryPage() {
  const history = useCycleStore((state) => state.history);
  const cycleLength = useCycleStore((state) => state.cycleLength);
  const setCycleLength = useCycleStore((state) => state.setCycleLength);
  const loadFromHistory = useCycleStore((state) => state.loadFromHistory);
  const removeFromHistory = useCycleStore((state) => state.removeFromHistory);
  const isLoggedIn = useAuthStore((state) => Boolean(state.user));
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<CycleHistoryEntry | null>(null);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const stats = useMemo(() => calculateCycleStats(history), [history]);

  const handleApplyAverage = (avg: number) => {
    setCycleLength(avg);
    setAppliedNotice(`현재 주기가 평균 주기인 ${avg}일로 설정되었어요.`);
    window.setTimeout(() => setAppliedNotice(null), 3000);
  };

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
    <section className="relative z-30 rounded-3xl bg-white/90 p-6 shadow-petal ring-1 ring-primary-100/70 backdrop-blur dark:bg-stone-900/90 dark:ring-stone-800 dark:shadow-none">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-primary-700 dark:text-primary-400">
          저장된 주기 기록
        </h2>
        <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-medium text-primary-600 dark:bg-primary-950/70 dark:text-primary-300 dark:ring-1 dark:ring-primary-800/60">
          {history.length}건
        </span>
      </div>
      {isLoggedIn && (
        <p className="-mt-2 mb-3 text-[11px] text-gray-400 dark:text-stone-500">
          로그인 상태라서 이 기록들은 서버에도 저장돼요.
        </p>
      )}
      {!isLoggedIn && history.length > 0 && (
        <div className="-mt-2 mb-4 flex items-center justify-between rounded-2xl bg-primary-50/70 px-3.5 py-2.5 text-xs text-primary-900 dark:bg-stone-800/80 dark:text-stone-200">
          <span>기록을 잃어버리지 않게 서버에 동기화할 수 있어요.</span>
          <Link
            to="/login"
            state={{ from: '/history' }}
            className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
          >
            로그인하기
          </Link>
        </div>
      )}

      {history.length >= 2 && stats.intervalCount >= 1 && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-primary-150/80 bg-gradient-to-br from-primary-50/60 via-white to-sand-50/50 p-4 shadow-xs dark:border-stone-800 dark:from-stone-850 dark:via-stone-900 dark:to-stone-900">
          <div className="flex items-center justify-between border-b border-primary-100/60 pb-2.5 dark:border-stone-800">
            <div className="flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary-900 dark:text-primary-300">
                나의 주기 통계 분석
              </h3>
            </div>
            <span className="text-[11px] font-medium text-gray-500 dark:text-stone-400">
              {stats.intervalCount}회 간격 분석
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center sm:gap-3">
            <div className="rounded-xl bg-white/90 p-2.5 shadow-2xs ring-1 ring-primary-100/60 dark:bg-stone-800/80 dark:ring-stone-750">
              <p className="text-[11px] font-medium text-gray-500 dark:text-stone-400">평균 주기</p>
              <p className="mt-1 font-display text-lg font-bold text-primary-700 sm:text-xl dark:text-primary-300">
                {stats.averageInterval}
                <span className="text-xs font-normal">일</span>
              </p>
              <p className="text-[10px] text-gray-400 dark:text-stone-500">
                약 {stats.roundedAverageInterval}일
              </p>
            </div>

            <div className="rounded-xl bg-white/90 p-2.5 shadow-2xs ring-1 ring-primary-100/60 dark:bg-stone-800/80 dark:ring-stone-750">
              <p className="text-[11px] font-medium text-gray-500 dark:text-stone-400">이전 주기</p>
              <p className="mt-1 font-display text-lg font-bold text-rose-600 sm:text-xl dark:text-rose-400">
                {stats.previousInterval}
                <span className="text-xs font-normal">일</span>
              </p>
              <p className="text-[10px] text-gray-400 dark:text-stone-500">
                직전 기록 간격
              </p>
            </div>

            <div className="rounded-xl bg-white/90 p-2.5 shadow-2xs ring-1 ring-primary-100/60 dark:bg-stone-800/80 dark:ring-stone-750">
              <p className="text-[11px] font-medium text-gray-500 dark:text-stone-400">주기 변동</p>
              <p className="mt-1 font-display text-lg font-bold text-gray-800 sm:text-xl dark:text-stone-200">
                {stats.minInterval}~{stats.maxInterval}
                <span className="text-xs font-normal">일</span>
              </p>
              <p className="text-[10px] text-gray-400 dark:text-stone-500">
                최소 ~ 최대
              </p>
            </div>
          </div>

          {stats.roundedAverageInterval !== null && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs ring-1 ring-primary-100/50 dark:bg-stone-800/50 dark:ring-stone-800">
              <span className="text-gray-600 dark:text-stone-300">
                현재 설정 주기: <strong className="font-semibold text-primary-700 dark:text-primary-400">{cycleLength}일</strong>
              </span>
              {cycleLength !== stats.roundedAverageInterval ? (
                <button
                  type="button"
                  onClick={() => handleApplyAverage(stats.roundedAverageInterval!)}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs transition hover:bg-primary-700 active:scale-95"
                >
                  <Sparkles size={13} />
                  평균({stats.roundedAverageInterval}일)으로 맞추기
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <Check size={13} />
                  평균 주기와 일치해요
                </span>
              )}
            </div>
          )}

          {appliedNotice && (
            <p className="mt-2 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {appliedNotice}
            </p>
          )}

          <p className="mt-2.5 text-[11px] text-gray-400 leading-tight dark:text-stone-500">
            💡 주기는 생리 시작 당일(1일차)부터 다음 생리 시작 전날까지의 일수(기록 간격)예요.
          </p>
        </div>
      )}

      {history.length === 1 && (
        <div className="mb-5 rounded-2xl border border-dashed border-primary-200/80 bg-primary-50/30 p-4 text-xs text-primary-900 dark:border-stone-800 dark:bg-stone-850/40 dark:text-stone-300">
          <div className="flex items-center gap-1.5 font-semibold text-primary-700 dark:text-primary-300">
            <Activity className="h-4 w-4" />
            <span>주기 통계 분석 안내</span>
          </div>
          <p className="mt-1 text-gray-600 dark:text-stone-400">
            기록이 1건 있어요. 생리 시작일을 1건 더 추가하시면 실제 기록 간격과 이전 주기, 평균 주기를 자동으로 계산해 드려요.
          </p>
          <p className="mt-1 text-[11px] text-gray-400 dark:text-stone-500">
            현재 설정 주기: {cycleLength}일 (생리 시작 당일부터 1일차로 카운트됩니다)
          </p>
        </div>
      )}

      {history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary-200/70 bg-primary-50/40 p-8 text-center dark:border-stone-800 dark:bg-stone-850/50">
          <p className="text-sm font-medium text-primary-700 dark:text-primary-400">
            아직 저장된 기록이 없어요
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-stone-400">
            메인 화면에서 입력값을 조정한 뒤 「계산하기」를 누르면 여기에 쌓입니다.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {history.map((entry) => {
            const interval = stats.intervalsByEntryId[entry.id];
            const diff = stats.diffsByEntryId[entry.id];

            return (
              <li
                key={entry.id}
                className="flex items-center gap-3 rounded-2xl border border-primary-100/70 bg-white p-2.5 transition hover:border-primary-300 hover:shadow-petal dark:border-stone-800 dark:bg-stone-850 dark:hover:border-stone-700"
              >
                <button
                  type="button"
                  onClick={() => handleLoad(entry.id)}
                  className="min-w-0 flex-1 rounded-xl p-2 text-left transition hover:bg-primary-50/50 active:scale-[0.99] dark:hover:bg-stone-800"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatDate(parseLocalDate(entry.lastPeriodDate))} 시작
                    </p>
                    {interval !== null && interval !== undefined ? (
                      <span className="inline-flex items-center rounded-full bg-primary-100/90 px-2 py-0.5 text-[11px] font-semibold text-primary-800 dark:bg-primary-950/80 dark:text-primary-300">
                        이전 주기와 {interval}일 간격
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-sand-100/80 px-2 py-0.5 text-[11px] font-medium text-sand-800 dark:bg-stone-800 dark:text-stone-400">
                        첫 기준 기록
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-gray-500 dark:text-stone-300">
                    <span>
                      주기 {entry.cycleLength}일 · 생리 기간 {entry.periodLength}일
                    </span>
                    {diff !== null && diff !== undefined && (
                      <span className="text-[11px] text-gray-400 dark:text-stone-400">
                        {diff === 0
                          ? '(설정 주기와 일치)'
                          : diff > 0
                            ? `(설정보다 +${diff}일)`
                            : `(설정보다 ${diff}일)`}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[11px] text-gray-400 dark:text-stone-500">
                    저장일 {formatDate(new Date(entry.savedAt))}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(entry)}
                  className="shrink-0 rounded-full border border-transparent px-3 py-1.5 text-xs font-medium text-gray-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:text-stone-400 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/60 dark:hover:text-rose-400"
                  aria-label={`${formatDate(parseLocalDate(entry.lastPeriodDate))} 주기 기록 삭제`}
                >
                  삭제
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {deleteTarget &&
        createPortal(
          <div
            role="presentation"
            onClick={() => setDeleteTarget(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs transition-opacity"
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-dialog-title"
              aria-describedby="delete-dialog-desc"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-bloom ring-1 ring-primary-100/70 dark:bg-stone-900 dark:ring-stone-800 dark:shadow-2xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 ring-1 ring-rose-100 dark:bg-rose-950/60 dark:text-rose-400 dark:ring-rose-900/60">
                <Trash2 size={22} strokeWidth={2.25} />
              </div>

              <h3
                id="delete-dialog-title"
                className="mt-4 font-display text-lg font-bold text-gray-900 dark:text-white"
              >
                주기 기록을 삭제할까요?
              </h3>

              <p id="delete-dialog-desc" className="mt-2 text-sm text-gray-600 leading-relaxed dark:text-stone-300">
                <strong className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(parseLocalDate(deleteTarget.lastPeriodDate))}
                </strong>{' '}
                시작 기록(주기 {deleteTarget.cycleLength}일, 기간 {deleteTarget.periodLength}일)이 목록에서 완전히 삭제됩니다.
              </p>
              <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">
                삭제한 기록은 다시 복구할 수 없어요.
              </p>
              <div className="mt-6 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 active:scale-[0.98] dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
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
          </div>,
          document.body,
        )}
    </section>
  );
}
