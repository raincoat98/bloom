import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Trash2, X } from 'lucide-react';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import SymptomEmoji from '../components/SymptomEmoji';
import SymptomTracker from '../components/SymptomTracker';
import type { SymptomId } from '../data/symptoms';
import { SYMPTOM_BY_ID } from '../data/symptoms';
import type { SymptomLog } from '../store/symptomStore';
import { useSymptomStore } from '../store/symptomStore';
import { formatDate } from '../utils/cycle';
import { useI18n } from '../i18n';

interface ModalTarget {
  type: 'entry' | 'single';
  id: string;
  logDate: string;
  symptoms: SymptomId[];
  symptom?: SymptomId;
}

export default function SymptomsPage() {
  const { t } = useI18n();
  const logs = useSymptomStore((state) => state.logs);
  const logDate = useSymptomStore((state) => state.logDate);
  const setLogDate = useSymptomStore((state) => state.setLogDate);
  const removeLog = useSymptomStore((state) => state.removeLog);
  const removeSymptomFromLog = useSymptomStore((state) => state.removeSymptomFromLog);

  const [showAll, setShowAll] = useState(false);
  const [modalTarget, setModalTarget] = useState<ModalTarget | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const recentSymptoms = showAll ? logs : logs.slice(0, 5);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 2500);
  };

  const handleConfirmDelete = () => {
    if (!modalTarget) return;
    if (modalTarget.type === 'entry') {
      removeLog(modalTarget.id);
      triggerToast(t('증상 기록을 삭제했어요.'));
    } else if (modalTarget.type === 'single' && modalTarget.symptom) {
      removeSymptomFromLog(modalTarget.id, modalTarget.symptom);
      const label = t(SYMPTOM_BY_ID[modalTarget.symptom]?.label ?? '증상');
      triggerToast(t("'{name}' 증상을 삭제했어요.", { name: label }));
    }
    setModalTarget(null);
  };
  return (
    <>
      <SymptomTracker />

      <section className="relative z-20 mt-6 rounded-3xl bg-white/80 p-6 shadow-petal ring-1 ring-primary-100/70 backdrop-blur dark:bg-stone-900/90 dark:ring-stone-800 dark:shadow-none">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-primary-700 dark:text-primary-400">
              {t('최근 증상')}
            </h2>
            <p className="mt-1 text-xs text-gray-400 dark:text-stone-500">
              {t('최근에 기록한 컨디션을 한눈에 확인해 보세요.')}
            </p>
          </div>
          <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-medium text-primary-600 dark:bg-primary-950/70 dark:text-primary-300 dark:ring-1 dark:ring-primary-800/60">
            {t('{count}건', { count: logs.length })}
          </span>
        </div>

        {recentSymptoms.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-primary-200/70 bg-primary-50/40 px-4 py-8 text-center dark:border-stone-800 dark:bg-stone-850/50">
            <p className="text-sm font-medium text-primary-700 dark:text-primary-400">
              {t('아직 기록한 증상이 없어요')}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-stone-400">
              {t('위에서 오늘의 증상을 선택하면 여기에 차곡차곡 보여드려요.')}
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {recentSymptoms.map((entry: SymptomLog) => {
              const isSelectedDate = entry.logDate === logDate;
              return (
                <li
                  key={entry.id}
                  className={`flex flex-col gap-2 rounded-2xl border bg-white px-4 py-3 transition dark:bg-stone-850 sm:flex-row sm:items-center sm:justify-between ${
                    isSelectedDate
                      ? 'border-primary-300 ring-1 ring-primary-100 shadow-xs dark:border-primary-500 dark:ring-primary-900/50'
                      : 'border-primary-100/70 dark:border-stone-800'
                  }`}
                >
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLogDate(entry.logDate)}
                      title={t('기록 날짜로 선택하기')}
                      className="text-left text-xs font-medium text-gray-700 transition hover:text-primary-600 hover:underline dark:text-stone-200 dark:hover:text-primary-400"
                    >
                      <time dateTime={entry.logDate}>
                        {formatDate(new Date(`${entry.logDate}T00:00:00`))}
                      </time>
                    </button>
                    {isSelectedDate && (
                      <span className="rounded-full bg-primary-100/80 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300 dark:ring-1 dark:ring-primary-800/60">
                        {t('선택 중')}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {(entry.symptoms ?? []).map((symptom) => (
                      <span
                        key={symptom}
                        className="group/tag inline-flex items-center gap-1 rounded-full bg-primary-50 py-1 pl-2.5 pr-1.5 text-[11px] font-medium text-primary-700 ring-1 ring-primary-100/60 transition hover:bg-primary-100/60 dark:bg-primary-950/80 dark:text-primary-300 dark:ring-primary-800/60 dark:hover:bg-primary-900/80"
                      >
                        <SymptomEmoji symptom={symptom} className="h-4 w-4" />
                        <span>{t(SYMPTOM_BY_ID[symptom].label)}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setModalTarget({
                              type: 'single',
                              id: entry.id,
                              logDate: entry.logDate,
                              symptoms: [symptom],
                              symptom,
                            })
                          }
                          className="rounded-full p-0.5 text-primary-400 transition hover:bg-rose-100 hover:text-rose-600 dark:text-primary-400 dark:hover:bg-rose-950 dark:hover:text-rose-400"
                          aria-label={t('{date} {name} 증상 삭제', { date: formatDate(new Date(`${entry.logDate}T00:00:00`)), name: t(SYMPTOM_BY_ID[symptom].label) })}
                          title={t('{name} 삭제', { name: t(SYMPTOM_BY_ID[symptom].label) })}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setModalTarget({
                        type: 'entry',
                        id: entry.id,
                        logDate: entry.logDate,
                        symptoms: entry.symptoms,
                      })
                    }
                    className="group/btn inline-flex shrink-0 items-center gap-1 self-end rounded-full px-2.5 py-1 text-[11px] font-medium text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 dark:text-stone-400 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 sm:self-auto"
                    aria-label={t('{date} 증상 기록 전체 삭제', { date: formatDate(new Date(`${entry.logDate}T00:00:00`)) })}
                  >
                    <Trash2 size={12} className="transition group-hover/btn:scale-110" />
                    <span>{t('삭제')}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {logs.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-2xl border border-dashed border-primary-200 bg-primary-50/40 py-2 text-xs font-medium text-primary-700 transition hover:bg-primary-50 dark:border-stone-800 dark:bg-stone-850/50 dark:text-primary-300 dark:hover:bg-stone-800"
          >
            {showAll ? (
              <>
                <span>{t('최근 5건만 보기')}</span>
                <ChevronUp size={14} />
              </>
            ) : (
              <>
                <span>{t('더보기 ({count}건 더)', { count: logs.length - 5 })}</span>
                <ChevronDown size={14} />
              </>
            )}
          </button>
        )}
      </section>

      <DeleteConfirmModal
        isOpen={Boolean(modalTarget)}
        onClose={() => setModalTarget(null)}
        onConfirm={handleConfirmDelete}
        logDate={modalTarget?.logDate ?? ''}
        symptoms={modalTarget?.symptoms ?? []}
        isSingleSymptom={modalTarget?.type === 'single'}
      />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gray-900/90 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur"
        >
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
