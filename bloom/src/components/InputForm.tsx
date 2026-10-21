import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, RotateCcw, Sparkles } from 'lucide-react';
import { useCycleStore } from '../store/cycleStore';
import { calculateCycleStats } from '../utils/cycle';
import { useI18n } from '../i18n';
import DatePopover from './DatePopover';

export default function InputForm() {
  const { t } = useI18n();
  const {
    lastPeriodDate,
    cycleLength,
    periodLength,
    history,
    setLastPeriodDate,
    setCycleLength,
    setPeriodLength,
    reset,
    addToHistory,
  } = useCycleStore();

  const stats = useMemo(() => calculateCycleStats(history), [history]);
  const [savedFlash, setSavedFlash] = useState(false);
  const [showAverages, setShowAverages] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false,
  );

  const [tempCycleLength, setTempCycleLength] = useState(cycleLength);
  const [tempPeriodLength, setTempPeriodLength] = useState(periodLength);
  const [averageSavedFlash, setAverageSavedFlash] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setTempCycleLength(cycleLength);
  }, [cycleLength]);

  useEffect(() => {
    setTempPeriodLength(periodLength);
  }, [periodLength]);

  const hasAverageChanges =
    tempCycleLength !== cycleLength || tempPeriodLength !== periodLength;

  const handleSaveAverages = () => {
    setCycleLength(tempCycleLength);
    setPeriodLength(tempPeriodLength);
    setAverageSavedFlash(true);
    window.setTimeout(() => setAverageSavedFlash(false), 2000);
  };

  const handleConfirmReset = () => {
    reset();
    setTempCycleLength(28);
    setTempPeriodLength(5);
    setShowResetConfirm(false);
    setAverageSavedFlash(true);
    window.setTimeout(() => setAverageSavedFlash(false), 2000);
  };

  useEffect(() => {
    if (!showResetConfirm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowResetConfirm(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResetConfirm]);

  const handleToggleAverages = () => {
    setShowAverages((prev) => {
      if (prev) {
        setTempCycleLength(cycleLength);
        setTempPeriodLength(periodLength);
      }
      return !prev;
    });
  };

  const handleSave = () => {
    if (hasAverageChanges) {
      setCycleLength(tempCycleLength);
      setPeriodLength(tempPeriodLength);
    }
    addToHistory();
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1800);
  };
  return (
    <section className="relative z-30 rounded-3xl bg-white/90 p-6 shadow-petal ring-1 ring-primary-100/70 backdrop-blur dark:bg-stone-900/90 dark:ring-stone-800 dark:shadow-none">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-primary-700 dark:text-primary-400">
          {t('나의 리듬 입력')}
        </h2>
        <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-medium text-primary-600 dark:bg-primary-950/70 dark:text-primary-300 dark:ring-1 dark:ring-primary-800/60">
          STEP 1
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-stone-200">
              {t('마지막 생리 시작일')}
            </span>
            <button
              type="button"
              onClick={() => setLastPeriodDate(new Date().toISOString().slice(0, 10))}
              className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-100/80 active:scale-95 shadow-xs dark:bg-primary-950/80 dark:text-primary-300 dark:ring-1 dark:ring-primary-800/60 dark:hover:bg-primary-900"
            >
              {t('오늘')}
            </button>
          </div>
          <DatePopover
            value={lastPeriodDate}
            onChange={setLastPeriodDate}
          />
          <p className="mt-1.5 text-[11px] text-gray-400 dark:text-stone-500">
            {t('생리 시작 첫날(당일)을 선택해 주세요. 해당 날짜가 1일차로 계산됩니다.')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleAverages}
          className="flex w-full items-center justify-between rounded-2xl bg-sand-50/70 px-4 py-2.5 text-left text-xs font-medium text-gray-600 transition hover:bg-sand-100/70 ring-1 ring-sand-200/60 dark:bg-stone-800/70 dark:text-stone-300 dark:ring-stone-700/60 dark:hover:bg-stone-800"
          aria-expanded={showAverages}
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-stone-400">{t('평균 주기 설정')}</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-primary-600 shadow-xs dark:bg-stone-700 dark:text-primary-300">
              {t('{cycle}일 · {period}일간', { cycle: cycleLength, period: periodLength })}
            </span>
            {hasAverageChanges && showAverages && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/70 dark:text-amber-300">
                {t('수정 중')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-gray-400 dark:text-stone-400">
            <span>{showAverages ? t('접기') : t('설정 변경')}</span>
            <ChevronDown
              size={15}
              strokeWidth={2.25}
              className={`transition-transform duration-200 ${showAverages ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {showAverages && (
          <div className="space-y-4 rounded-2xl border border-primary-100/60 bg-white/60 p-4 transition-all dark:border-stone-800 dark:bg-stone-800/40">
            <label className="block">
              <span className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-stone-200">
                <span>
                  {t('평균 주기 길이:')}{' '}
                  <span className="text-primary-600 dark:text-primary-400">{t('{count}일', { count: tempCycleLength })}</span>
                </span>
                {stats.roundedAverageInterval !== null && (
                  <button
                    type="button"
                    onClick={() => setTempCycleLength(Math.min(40, Math.max(21, stats.roundedAverageInterval!)))}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700 transition hover:bg-primary-100 dark:bg-primary-950/70 dark:text-primary-300 dark:hover:bg-primary-900"
                  >
                    <Sparkles size={11} />
                    {t('실제 기록 평균({count}일) 적용', { count: stats.roundedAverageInterval })}
                  </button>
                )}
              </span>
              <input
                type="range"
                min={21}
                max={40}
                value={tempCycleLength}
                onChange={(e) => setTempCycleLength(Number(e.target.value))}
                className="bloom-slider"
                style={
                  {
                    '--fill': `${((tempCycleLength - 21) / (40 - 21)) * 100}%`,
                  } as CSSProperties
                }
              />
              <div className="mt-2 flex justify-between text-xs text-gray-400 dark:text-stone-400">
                <span>{t('{count}일', { count: 21 })}</span>
                <span>{t('{count}일', { count: 40 })}</span>
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-stone-200">
                {t('평균 생리 기간:')}{' '}
                <span className="text-primary-600 dark:text-primary-400">{t('{count}일', { count: tempPeriodLength })}</span>
              </span>
              <input
                type="range"
                min={2}
                max={10}
                value={tempPeriodLength}
                onChange={(e) => setTempPeriodLength(Number(e.target.value))}
                className="bloom-slider"
                style={
                  {
                    '--fill': `${((tempPeriodLength - 2) / (10 - 2)) * 100}%`,
                  } as CSSProperties
                }
              />
              <div className="mt-2 flex justify-between text-xs text-gray-400 dark:text-stone-400">
                <span>{t('{count}일', { count: 2 })}</span>
                <span>{t('{count}일', { count: 10 })}</span>
              </div>
            </label>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleSaveAverages}
                disabled={!hasAverageChanges}
                className="w-full rounded-xl bg-primary-600 py-2.5 text-xs font-semibold text-white shadow-petal transition hover:bg-primary-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none dark:bg-primary-500 dark:hover:bg-primary-600 dark:disabled:bg-stone-700 dark:disabled:text-stone-500"
              >
                {hasAverageChanges ? t('평균 설정 저장') : t('저장 완료 (변경사항 없음)')}
              </button>

              {averageSavedFlash && (
                <p className="text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {t('평균 주기 설정이 저장되었어요')}
                </p>
              )}

              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full rounded-xl border border-primary-200/80 bg-white py-2 text-xs font-medium text-primary-700 transition hover:bg-primary-50 dark:border-stone-700 dark:bg-stone-800 dark:text-primary-300 dark:hover:bg-stone-700 active:scale-[0.99]"
              >
                {t('기본값으로 다시 시작')}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-xl bg-gradient-to-br from-primary-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-petal transition hover:brightness-105 active:scale-[0.99]"
          >
            {t('계산하기')}
          </button>
          {savedFlash && (
            <p className="text-center text-xs text-primary-600 dark:text-primary-400">
              {t('이력에 저장되었어요')}
            </p>
          )}
        </div>
      </div>

      {showResetConfirm &&
        createPortal(
          <div
            role="presentation"
            onClick={() => setShowResetConfirm(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs transition-opacity"
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="reset-dialog-title"
              aria-describedby="reset-dialog-desc"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-bloom ring-1 ring-primary-100/70 dark:bg-stone-850 dark:ring-stone-750"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 ring-1 ring-amber-100 dark:bg-amber-950/70 dark:text-amber-400 dark:ring-amber-900/60">
                <RotateCcw size={22} strokeWidth={2.25} />
              </div>

              <h3
                id="reset-dialog-title"
                className="mt-4 font-display text-lg font-bold text-gray-900 dark:text-white"
              >
                {t('기본값으로 초기화할까요?')}
              </h3>

              <p
                id="reset-dialog-desc"
                className="mt-2 text-sm text-gray-600 leading-relaxed dark:text-stone-300"
              >
                {t('평균 주기 길이 {cycle}, 생리 기간 {period}로 다시 설정됩니다.', { cycle: t('{count}일', { count: 28 }), period: t('{count}일', { count: 5 }) })}
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-stone-500">
                {t('기존에 저장된 주기 이력은 삭제되지 않아요.')}
              </p>

              <div className="mt-6 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 active:scale-[0.98] dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                >
                  {t('취소')}
                 </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="flex-1 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 active:scale-[0.98] dark:bg-primary-500 dark:hover:bg-primary-600"
                >
                  {t('초기화하기')}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
