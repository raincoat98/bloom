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
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-left text-gray-800 transition hover:border-primary-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
      >
        <span className="font-medium">
          {selected
            ? format(selected, 'yyyy년 M월 d일 (EEE)', { locale: ko })
            : '날짜 선택'}
        </span>
        <CalendarIcon size={18} className="text-primary-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 origin-top rounded-2xl bg-white p-5 shadow-bloom ring-1 ring-primary-100">
          <DayPicker
            mode="single"
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
        </div>
      )}
    </div>
  );
}

function parseLocalDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
