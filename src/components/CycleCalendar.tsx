import { useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { ko } from 'date-fns/locale';
import { differenceInCalendarDays } from 'date-fns';
import { useCycleStore } from '../store/cycleStore';

export default function CycleCalendar() {
  const { lastPeriodDate, cycleLength, periodLength } = useCycleStore();

  const { isPeriod, isFertile, isOvulation } = useMemo(() => {
    const anchor = parseLocalDate(lastPeriodDate);
    const ovulationOffset = cycleLength - 14;

    const cyclePosition = (date: Date) => {
      const diff = differenceInCalendarDays(date, anchor);
      return ((diff % cycleLength) + cycleLength) % cycleLength;
    };

    return {
      isPeriod: (date: Date) => cyclePosition(date) < periodLength,
      isFertile: (date: Date) => {
        const pos = cyclePosition(date);
        return pos >= ovulationOffset - 5 && pos <= ovulationOffset + 1;
      },
      isOvulation: (date: Date) => cyclePosition(date) === ovulationOffset,
    };
  }, [lastPeriodDate, cycleLength, periodLength]);

  return (
    <section className="mt-6 rounded-3xl bg-white/90 p-6 shadow-petal ring-1 ring-primary-100/50 backdrop-blur sm:p-8">
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            나의 리듬 캘린더
          </p>
          <h2 className="font-display text-xl font-bold text-gray-900">
            한 달 흐름 보기
          </h2>
        </div>
        <Legend />
      </header>

      <div className="flex justify-center">
        <DayPicker
          showOutsideDays
          locale={ko}
          className="bloom-calendar bloom-cycle-calendar"
          modifiers={{
            period: isPeriod,
            ovulation: isOvulation,
            fertile: isFertile,
          }}
          modifiersClassNames={{
            period: 'bloom-day-period',
            fertile: 'bloom-day-fertile',
            ovulation: 'bloom-day-ovulation',
          }}
        />
      </div>
    </section>
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-gray-500">
      <LegendItem className="bg-red-300" label="생리" />
      <LegendItem className="bg-emerald-200" label="가임기" />
      <LegendItem className="bg-emerald-500" label="배란" />
    </ul>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <li className="flex items-center gap-1">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${className}`} />
      <span>{label}</span>
    </li>
  );
}

function parseLocalDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
