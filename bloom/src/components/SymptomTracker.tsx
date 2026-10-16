import { useState } from 'react';
import { SYMPTOM_BY_ID, SYMPTOM_IDS } from '../data/symptoms';
import { useSymptomStore } from '../store/symptomStore';
import DatePopover from './DatePopover';
import SymptomEmoji from './SymptomEmoji';

export default function SymptomTracker() {
  const logDate = useSymptomStore((state) => state.logDate);
  const symptoms = useSymptomStore((state) => state.symptoms);
  const setLogDate = useSymptomStore((state) => state.setLogDate);
  const toggleSymptom = useSymptomStore((state) => state.toggleSymptom);
  const saveLog = useSymptomStore((state) => state.saveLog);
  const [savedFlash, setSavedFlash] = useState(false);

  const handleSave = () => {
    saveLog();
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1800);
  };

  return (
    <section className="relative z-20 rounded-3xl bg-white/90 p-6 shadow-petal ring-1 ring-primary-100/70 backdrop-blur">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-primary-700">
            컨디션 기록
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            지금 느껴지는 증상을 골라 따로 기록해 보세요.
          </p>
        </div>
        <span className="text-xs font-medium text-primary-600">
          {symptoms.length > 0 ? `${symptoms.length}개 선택` : '여러 개 선택 가능'}
        </span>
      </div>

      <label className="mt-4 block max-w-sm">
        <span className="mb-1 block text-sm font-medium text-gray-700">
          기록 날짜
        </span>
        <DatePopover value={logDate} onChange={setLogDate} />
      </label>

      <div className="mt-4 grid grid-cols-4 gap-2 lg:grid-cols-8">
        {SYMPTOM_IDS.map((symptom) => {
          const option = SYMPTOM_BY_ID[symptom];
          const selected = symptoms.includes(symptom);
          return (
            <button
              key={symptom}
              type="button"
              aria-pressed={selected}
              onClick={() => toggleSymptom(symptom)}
              className={`flex min-h-20 flex-col items-center justify-center rounded-2xl border px-1.5 py-2.5 text-center transition active:scale-[0.98] ${
                selected
                  ? 'border-primary-400 bg-primary-50 text-primary-800 shadow-sm ring-1 ring-primary-200'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:bg-primary-50/50'
              }`}
            >
              <SymptomEmoji symptom={symptom} className="h-8 w-8" />
              <span className="mt-1.5 text-[11px] font-medium leading-tight">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
        {savedFlash && (
          <p className="text-center text-xs text-primary-600" role="status">
            증상을 기록했어요
          </p>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={symptoms.length === 0}
          className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-petal transition hover:bg-primary-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
        >
          증상 기록하기
        </button>
      </div>
    </section>
  );
}
