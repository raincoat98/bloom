import { useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import type { DayProps } from 'react-day-picker';
import { enUS, ja, ko, zhCN } from 'date-fns/locale';
import { differenceInCalendarDays } from 'date-fns';
import { useCycleStore } from '../store/cycleStore';
import { parseLocalDate } from '../utils/cycle';
import { useI18n } from '../i18n';
const flowBadgeByModifier = {
  period: {
    text: '생리',
    label: '생리 예정',
    className: 'bloom-flow-badge-period',
  },
  fertile: {
    text: '가임',
    label: '가임기 예정',
    className: 'bloom-flow-badge-fertile',
  },
  ovulation: {
    text: '배란',
    label: '배란 예정',
    className: 'bloom-flow-badge-ovulation',
  },
} as const;

function getFlowBadge(modifiers: DayProps['modifiers']) {
  if (modifiers.ovulation) return flowBadgeByModifier.ovulation;
  if (modifiers.period) return flowBadgeByModifier.period;
  if (modifiers.fertile) return flowBadgeByModifier.fertile;
  return null;
}
export default function CycleCalendar() {
  const { t, language } = useI18n();
  const { lastPeriodDate, cycleLength, periodLength } = useCycleStore();
  const [month, setMonth] = useState<Date>(() => new Date());

  const isCurrentMonth = useMemo(() => {
    const today = new Date();
    return (
      month.getFullYear() === today.getFullYear() &&
      month.getMonth() === today.getMonth()
    );
  }, [month]);

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
    <section className="mt-6 rounded-3xl bg-white/90 p-6 shadow-petal ring-1 ring-primary-100/50 backdrop-blur sm:p-8 dark:bg-stone-900/90 dark:ring-stone-800 dark:shadow-none">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-stone-400">
            {t('나의 리듬 캘린더')}
          </p>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
              {t('한 달 흐름 보기')}
            </h2>
            <button
              type="button"
              onClick={() => setMonth(new Date())}
              disabled={isCurrentMonth}
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition active:scale-95 ${
                isCurrentMonth
                  ? 'border border-gray-200/80 bg-gray-50/50 text-gray-400 cursor-default dark:border-stone-800 dark:bg-stone-800/50 dark:text-stone-500'
                  : 'bg-primary-50 text-primary-700 hover:bg-primary-100 ring-1 ring-primary-200/70 shadow-xs dark:bg-primary-950/80 dark:text-primary-300 dark:ring-1 dark:ring-primary-800/60 dark:hover:bg-primary-900'
              }`}
              title={t('오늘이 속한 달로 이동')}
            >
              {t('오늘')}
            </button>
          </div>
        </div>
        <Legend />
      </header>

      <div className="flex justify-center">
        <DayPicker
          month={month}
          onMonthChange={setMonth}
          showOutsideDays
          locale={language === 'en' ? enUS : language === 'ja' ? ja : language === 'zh' ? zhCN : ko}
          className="bloom-calendar bloom-cycle-calendar"
          components={{ Day: CycleDay }}
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

function CycleDay({
  day,
  modifiers,
  className,
  children,
  ...dayProps
}: DayProps) {
  void day;
  const { t, language } = useI18n();
  const badge = getFlowBadge(modifiers);
  const ariaLabel =
    badge && dayProps['aria-label']
      ? `${dayProps['aria-label']}, ${t(badge.label)}`
      : dayProps['aria-label'];

  return (
    <td {...dayProps} aria-label={ariaLabel} className={className}>
      <span className={`bloom-cycle-day${badge ? ' bloom-day-with-badge' : ''}`}>
        <span className="bloom-day-number">{children}</span>
        {badge ? (
          <span
            aria-hidden="true"
            className={`bloom-flow-badge ${badge.className}`}
          >
            {language === 'ko' ? badge.text : t(`${badge.text} (달력)`)}
          </span>
        ) : null}
      </span>
    </td>
  );
}

function Legend() {
  const { t } = useI18n();
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-gray-500 dark:text-stone-400">
      <LegendItem className="bg-red-300" label={t('생리')} />
      <LegendItem className="bg-emerald-200" label={t('가임기')} />
      <LegendItem className="bg-violet-500" label={t('배란')} />
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
