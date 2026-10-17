import { useEffect, useRef } from 'react';
import { Trash2, AlertCircle } from 'lucide-react';
import type { SymptomId } from '../data/symptoms';
import { SYMPTOM_BY_ID } from '../data/symptoms';
import SymptomEmoji from './SymptomEmoji';
import { formatDate } from '../utils/cycle';

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  logDate: string;
  symptoms: SymptomId[];
  isSingleSymptom?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  logDate,
  symptoms,
  isSingleSymptom = false,
}: DeleteConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    cancelBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
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

  const formattedDate = formatDate(new Date(`${logDate}T00:00:00`));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5 dark:bg-stone-900 dark:ring-stone-800"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 ring-1 ring-rose-100 dark:bg-rose-950/60 dark:text-rose-400 dark:ring-rose-900/60">
          <Trash2 size={22} />
        </div>

        <div className="mt-4 text-center">
          <h3
            id="delete-dialog-title"
            className="font-display text-base font-semibold text-gray-900 dark:text-white"
          >
            {isSingleSymptom
              ? '증상 기록을 삭제할까요?'
              : '해당 날짜의 증상 기록을 모두 삭제할까요?'}
          </h3>
          <p
            id="delete-dialog-description"
            className="mt-1.5 text-xs text-gray-500 dark:text-stone-400"
          >
            <span className="font-medium text-gray-700 dark:text-stone-200">{formattedDate}</span>
            {isSingleSymptom
              ? '에 기록된 증상을 삭제합니다.'
              : '에 기록된 모든 증상이 삭제됩니다.'}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-1.5 rounded-2xl bg-gray-50 p-3 ring-1 ring-gray-100 dark:bg-stone-800/60 dark:ring-stone-700/60">
          {symptoms.map((symptom) => (
            <span
              key={symptom}
              className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-primary-700 shadow-xs ring-1 ring-primary-100/70 dark:bg-stone-700 dark:text-primary-300 dark:ring-stone-600"
            >
              <SymptomEmoji symptom={symptom} className="h-4 w-4" />
              {SYMPTOM_BY_ID[symptom]?.label}
            </span>
          ))}
        </div>

        <p className="mt-3 flex items-center justify-center gap-1 text-[11px] font-medium text-rose-500 dark:text-rose-400">
          <AlertCircle size={13} className="shrink-0" />
          <span>삭제된 기록은 다시 복구할 수 없어요.</span>
        </p>

        <div className="mt-6 flex gap-2">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 active:scale-[0.99]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white shadow-petal transition hover:bg-rose-700 active:scale-[0.99]"
          >
            삭제하기
          </button>
        </div>
      </div>
    </div>
  );
}
