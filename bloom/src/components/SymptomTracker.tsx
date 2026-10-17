import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { SYMPTOM_BY_ID, SYMPTOM_IDS } from '../data/symptoms';
import { getTodayDateString, useSymptomStore } from '../store/symptomStore';
import DatePopover from './DatePopover';
import SymptomEmoji from './SymptomEmoji';

export default function SymptomTracker() {
  const logDate = useSymptomStore((state) => state.logDate);
  const symptoms = useSymptomStore((state) => state.symptoms);
  const logs = useSymptomStore((state) => state.logs);
  const setLogDate = useSymptomStore((state) => state.setLogDate);
  const toggleSymptom = useSymptomStore((state) => state.toggleSymptom);
  const saveLog = useSymptomStore((state) => state.saveLog);
  const [savedFlash, setSavedFlash] = useState(false);

  const recordedSymptoms = useMemo(() => {
    const forDate = logs.filter((entry) => entry.logDate === logDate);
    return new Set(forDate.flatMap((entry) => entry.symptoms));
  }, [logs, logDate]);

  const todayStr = getTodayDateString();
  const isToday = logDate === todayStr;
  const isAllRecorded = recordedSymptoms.size === SYMPTOM_IDS.length;

  const handleSave = () => {
    saveLog();
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  };

  return (
    <section className="relative z-20 rounded-3xl bg-white/90 p-6 shadow-petal ring-1 ring-primary-100/70 backdrop-blur dark:bg-stone-900/90 dark:ring-stone-800 dark:shadow-none">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-primary-700 dark:text-primary-400">
            컨디션 기록
          </h2>
          <p className="mt-1 text-xs text-gray-400 dark:text-stone-500">
            지금 느껴지는 증상을 골라 따로 기록해 보세요.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {recordedSymptoms.size > 0 && (
            <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-medium text-primary-700 ring-1 ring-primary-100 dark:bg-primary-950/60 dark:text-primary-300 dark:ring-primary-800/60">
              {recordedSymptoms.size}개 이미 기록됨
            </span>
          )}
          {symptoms.length > 0 ? (
            <span className="rounded-full bg-primary-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
              {symptoms.length}개 추가 선택
            </span>
          ) : isAllRecorded ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800/60">
              모든 증상 기록 완료
            </span>
          ) : (
            <span className="text-xs font-medium text-gray-400">
              {recordedSymptoms.size > 0 ? '추가 선택 가능' : '여러 개 선택 가능'}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 max-w-sm">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-stone-200">
            기록 날짜
          </span>
          {!isToday && (
            <button
              type="button"
              onClick={() => setLogDate(todayStr)}
              className="text-xs font-medium text-primary-600 transition hover:text-primary-700 hover:underline dark:text-primary-400 dark:hover:text-primary-300"
            >
              오늘로 변경
            </button>
          )}
        </div>
        <DatePopover value={logDate} onChange={setLogDate} />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 lg:grid-cols-8">
        {SYMPTOM_IDS.map((symptom) => {
          const option = SYMPTOM_BY_ID[symptom];
          const isRecorded = recordedSymptoms.has(symptom);
          const selected = !isRecorded && symptoms.includes(symptom);
          return (
            <button
              key={symptom}
              type="button"
              disabled={isRecorded}
              aria-pressed={selected}
              aria-disabled={isRecorded}
              title={
                isRecorded
                  ? `${option.label}은(는) 이미 이 날짜에 기록되어 있어요`
                  : selected
                    ? `${option.label} 선택 해제`
                    : `${option.label} 선택`
              }
              onClick={() => toggleSymptom(symptom)}
              className={`group flex min-h-[5.5rem] flex-col items-center justify-center rounded-2xl border px-1.5 py-2.5 text-center transition ${
                isRecorded
                  ? 'cursor-not-allowed border-dashed border-gray-200 bg-gray-50/70 text-gray-400 opacity-60 dark:border-stone-800 dark:bg-stone-800/40 dark:text-stone-500'
                  : selected
                    ? 'border-primary-400 bg-primary-50 text-primary-800 shadow-sm ring-1 ring-primary-200 dark:border-primary-500 dark:bg-primary-950/50 dark:text-primary-200 dark:ring-primary-800 active:scale-[0.98]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:bg-primary-50/50 dark:border-stone-800 dark:bg-stone-850 dark:text-stone-300 dark:hover:border-stone-700 dark:hover:bg-stone-800 active:scale-[0.98]'
              }`}
            >
              <SymptomEmoji
                symptom={symptom}
                className={`h-8 w-8 transition ${
                  isRecorded ? 'opacity-40 grayscale' : 'group-hover:scale-105'
                }`}
              />
              <span
                className={`mt-1.5 text-[11px] leading-tight ${
                  isRecorded
                    ? 'font-normal text-gray-400'
                    : selected
                      ? 'font-semibold text-primary-800 dark:text-primary-200'
                      : 'font-medium text-gray-700 dark:text-stone-300'
                }`}
              >
                {option.label}
              </span>
              {isRecorded ? (
                <span className="mt-1 inline-flex items-center rounded-full bg-primary-100/80 px-1.5 py-0.5 text-[9px] font-semibold text-primary-700 dark:bg-primary-950/80 dark:text-primary-300">
                  ✓ 기록됨
                </span>
              ) : selected ? (
                <span className="mt-1 inline-flex items-center rounded-full bg-primary-500 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                  선택됨
                </span>
              ) : (
                <span className="mt-1 invisible py-0.5 text-[9px]">대기</span>
              )}
            </button>
          );
        })}
      </div>

      {isAllRecorded && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-primary-100 bg-primary-50/60 px-3.5 py-2.5 text-xs text-primary-800 dark:border-stone-800 dark:bg-stone-850/60 dark:text-primary-300">
          <Check size={16} className="shrink-0 text-primary-600 dark:text-primary-400" />
          <span>선택한 날짜의 가능한 모든 증상이 기록되었습니다. 아래 &apos;최근 증상&apos;에서 확인하거나 삭제할 수 있어요.</span>
        </div>
      )}

      <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
        {savedFlash && (
          <p className="flex items-center justify-center gap-1 text-center text-xs font-medium text-primary-600 dark:text-primary-400" role="status">
            <Check size={14} />
            <span>증상을 기록했어요</span>
          </p>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={symptoms.length === 0}
          className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-petal transition hover:bg-primary-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none dark:disabled:bg-stone-800 dark:disabled:text-stone-600"
        >
          증상 기록하기
        </button>
      </div>
    </section>
  );
}
