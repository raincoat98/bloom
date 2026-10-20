import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CalendarPlus, Pencil, X } from 'lucide-react';
import type { CycleHistoryEntry } from '../store/cycleStore';
import DatePopover from './DatePopover';

export interface ManualCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEntry?: CycleHistoryEntry | null;
  defaultCycleLength?: number;
  defaultPeriodLength?: number;
  existingDates?: string[];
  onSubmit: (data: {
    lastPeriodDate: string;
    cycleLength: number;
    periodLength: number;
  }) => void;
}


export default function ManualCycleModal({
  isOpen,
  onClose,
  initialEntry,
  defaultCycleLength = 28,
  defaultPeriodLength = 5,
  existingDates = [],
  onSubmit,
}: ManualCycleModalProps) {
  const isEdit = Boolean(initialEntry);

  const [date, setDate] = useState<string>(() => initialEntry?.lastPeriodDate ?? new Date().toISOString().slice(0, 10));
  const [cycleLength, setCycleLength] = useState<number>(
    () => initialEntry?.cycleLength ?? defaultCycleLength,
  );
  const [periodLength, setPeriodLength] = useState<number>(
    () => initialEntry?.periodLength ?? defaultPeriodLength,
  );

  // 모달이 열리거나 대상 entry 가 변경될 때 폼 상태 동기화
  useEffect(() => {
    if (isOpen) {
      setDate(initialEntry?.lastPeriodDate ?? new Date().toISOString().slice(0, 10));
      setCycleLength(initialEntry?.cycleLength ?? defaultCycleLength);
      setPeriodLength(initialEntry?.periodLength ?? defaultPeriodLength);
    }
  }, [isOpen, initialEntry, defaultCycleLength, defaultPeriodLength]);

  // ESC 키 닫기 및 스크롤 고정
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDuplicateDate =
    existingDates.includes(date) &&
    (!initialEntry || initialEntry.lastPeriodDate !== date);

  const isUnchanged = Boolean(
    isEdit &&
      initialEntry &&
      date === initialEntry.lastPeriodDate &&
      cycleLength === initialEntry.cycleLength &&
      periodLength === initialEntry.periodLength,
  );

  const isSubmitDisabled = !date || isUnchanged;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;
    const clampedCycle = Math.min(120, Math.max(1, cycleLength));
    const clampedPeriod = Math.min(30, Math.max(1, periodLength));
    onSubmit({
      lastPeriodDate: date,
      cycleLength: clampedCycle,
      periodLength: clampedPeriod,
    });
    onClose();
  };


  const content = (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-xs transition-opacity sm:items-center sm:p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-cycle-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-bloom ring-1 ring-primary-100/70 dark:bg-stone-900 dark:ring-stone-800 sm:max-w-md sm:rounded-3xl dark:shadow-2xl"
      >
        <div className="mx-auto -mt-1 mb-3.5 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-stone-700 sm:hidden" />
        <div className="flex items-center justify-between pb-3 border-b border-primary-100/60 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 ring-1 ring-primary-100 dark:bg-primary-950/70 dark:text-primary-300 dark:ring-primary-800/60">
              {isEdit ? <Pencil size={18} /> : <CalendarPlus size={18} />}
            </div>
            <div>
              <h3
                id="manual-cycle-modal-title"
                className="font-display text-base font-bold text-gray-900 dark:text-white"
              >
                {isEdit ? '주기 기록 수정' : '주기 기록 직접 추가'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-stone-400">
                {isEdit
                  ? '기존 기록의 시작일과 설정을 수정해요.'
                  : '과거 생리 시작일을 입력해 통계에 반영하세요.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="manual-date"
                className="text-xs font-semibold text-gray-700 dark:text-stone-300"
              >
                생리 시작일 (1일차)
              </label>
              <button
                type="button"
                onClick={() => setDate(new Date().toISOString().slice(0, 10))}
                className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700 transition hover:bg-primary-100/80 active:scale-95 dark:bg-primary-950/80 dark:text-primary-300"
              >
                오늘로 설정
              </button>
            </div>
            <DatePopover value={date} onChange={setDate} />
            <p className="mt-1 text-[11px] text-gray-400 dark:text-stone-500">
              해당 날짜가 생리 시작 당일(1일차)로 등록됩니다.
            </p>
          </div>

          {isDuplicateDate && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800 ring-1 ring-amber-200/70 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800/60">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                <strong>{date}</strong> 날짜의 기록이 이미 있어요. 저장하면 해당 기록이 새로운 설정으로 갱신됩니다.
              </span>
            </div>
          )}

          <div className="rounded-2xl border border-primary-100/60 bg-sand-50/40 p-3.5 space-y-3.5 dark:border-stone-800 dark:bg-stone-850/50">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 dark:text-stone-300">
                  주기 길이
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCycleLength((prev) => Math.min(120, Math.max(1, prev - 1)))}
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-xs font-bold text-gray-600 shadow-2xs ring-1 ring-gray-200 hover:bg-gray-50 active:scale-95 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700"
                    aria-label="주기 1일 감소"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-xs font-bold text-primary-700 dark:text-primary-300">
                    {`${cycleLength}일`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCycleLength((prev) => Math.min(120, Math.max(1, prev + 1)))}
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-xs font-bold text-gray-600 shadow-2xs ring-1 ring-gray-200 hover:bg-gray-50 active:scale-95 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700"
                    aria-label="주기 1일 증가"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={21}
                max={45}
                value={Math.min(45, Math.max(21, cycleLength))}
                onChange={(e) => setCycleLength(Number(e.target.value))}
                className="bloom-slider"
                style={
                  {
                    '--fill': `${((Math.min(45, Math.max(21, cycleLength)) - 21) / (45 - 21)) * 100}%`,
                  } as CSSProperties
                }
              />
              <div className="mt-1 flex justify-between text-[10px] text-gray-400 dark:text-stone-500">
                <span>21일</span>
                <span>28일 (표준)</span>
                <span>45일</span>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 dark:text-stone-300">
                  생리 기간
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPeriodLength((prev) => Math.min(30, Math.max(1, prev - 1)))}
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-xs font-bold text-gray-600 shadow-2xs ring-1 ring-gray-200 hover:bg-gray-50 active:scale-95 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700"
                    aria-label="기간 1일 감소"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-xs font-bold text-primary-700 dark:text-primary-300">
                    {`${periodLength}일`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPeriodLength((prev) => Math.min(30, Math.max(1, prev + 1)))}
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-xs font-bold text-gray-600 shadow-2xs ring-1 ring-gray-200 hover:bg-gray-50 active:scale-95 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700"
                    aria-label="기간 1일 증가"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={2}
                max={10}
                value={Math.min(10, Math.max(2, periodLength))}
                onChange={(e) => setPeriodLength(Number(e.target.value))}
                className="bloom-slider"
                style={
                  {
                    '--fill': `${((Math.min(10, Math.max(2, periodLength)) - 2) / (10 - 2)) * 100}%`,
                  } as CSSProperties
                }
              />
              <div className="mt-1 flex justify-between text-[10px] text-gray-400 dark:text-stone-500">
                <span>2일</span>
                <span>5일 (표준)</span>
                <span>10일</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 active:scale-[0.98] dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="flex-1 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-semibold text-white shadow-petal transition hover:bg-primary-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:active:scale-100 dark:disabled:bg-stone-800 dark:disabled:text-stone-600"
            >
              {isEdit ? '수정 완료' : isDuplicateDate ? '기록 갱신' : '기록 추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' && document.body
    ? createPortal(content, document.body)
    : content;
}
