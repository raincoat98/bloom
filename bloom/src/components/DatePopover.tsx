import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { ko } from 'date-fns/locale';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DatePopoverProps {
  value: string;
  onChange: (date: string) => void;
}

export default function DatePopover({ value, onChange }: DatePopoverProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = value ? parseLocalDate(value) : undefined;
  const [viewMonth, setViewMonth] = useState<Date>(() => selected ?? new Date());

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => {
          if (!open) {
            setViewMonth(selected ?? new Date());
          }
          setOpen((v) => !v);
        }}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-left text-gray-800 transition hover:border-primary-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:border-primary-400 dark:focus:ring-primary-900/50"
      >
        <span className="font-medium">
          {selected
            ? format(selected, 'yyyy년 M월 d일 (EEE)', { locale: ko })
            : '날짜 선택'}
        </span>
        <CalendarIcon size={18} className="text-primary-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 max-w-[calc(100vw-2.5rem)] origin-top overflow-x-auto rounded-2xl bg-white p-3 shadow-bloom ring-1 ring-primary-100 dark:bg-stone-900 dark:ring-stone-700 dark:shadow-2xl sm:p-5">
          <DayPicker
            mode="single"
            month={viewMonth}
            onMonthChange={setViewMonth}
            selected={selected}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, 'yyyy-MM-dd'));
                setOpen(false);
              }
            }}
            locale={ko}
            showOutsideDays
            className="bloom-calendar"
          />
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-stone-800 pt-2.5">
            <button
              type="button"
              onClick={() => {
                const todayDate = new Date();
                onChange(format(todayDate, 'yyyy-MM-dd'));
                setViewMonth(todayDate);
                setOpen(false);
              }}
              className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-100 active:scale-95 dark:bg-primary-950/80 dark:text-primary-300 dark:ring-1 dark:ring-primary-800/60 dark:hover:bg-primary-900"
            >
              오늘로 선택
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-2.5 py-1 text-xs font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function parseLocalDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
