import { useMemo, type ReactNode } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import DropOfBlood from '@fluentui-emoji/react/modern/drop-of-blood';
import Blossom from '@fluentui-emoji/react/modern/blossom';
import Seedling from '@fluentui-emoji/react/modern/seedling';
import Shield from '@fluentui-emoji/react/modern/shield';
import { useCycleStore } from '../store/cycleStore';
import { useI18n } from '../i18n';
import {
  calculateCycle,
  calculateCycleStats,
  formatDate,
  formatShortDate,
  parseLocalDate,
} from '../utils/cycle';
import PhaseEmoji from './PhaseEmoji';
const phaseStyles: Record<string, string> = {
  '생리 중': 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300',
  여포기: 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300',
  배란기: 'bg-green-100 text-green-700 dark:bg-green-950/80 dark:text-green-300',
  황체기: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300',
};

export default function ResultCard() {
  const { t, language } = useI18n();
  const locale = language === 'zh' ? 'zh-CN' : language;
  const fullFormatter = useMemo(() => new Intl.DateTimeFormat(locale, {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  }), [locale]);
  const shortFormatter = useMemo(() => new Intl.DateTimeFormat(locale, {
    month: 'short', day: 'numeric',
  }), [locale]);
  const fullDate = (date: Date) => language === 'ko' ? formatDate(date) : fullFormatter.format(date);
  const shortDate = (date: Date) => language === 'ko' ? formatShortDate(date) : shortFormatter.format(date);
  const { lastPeriodDate, cycleLength, periodLength, history } = useCycleStore();
  const stats = useMemo(() => calculateCycleStats(history), [history]);

  const prediction = useMemo(
    () => calculateCycle(lastPeriodDate, cycleLength, periodLength),
    [lastPeriodDate, cycleLength, periodLength],
  );

  const daysUntilUpcomingStart = useMemo(() => {
    const today = new Date();
    return differenceInCalendarDays(
      parseLocalDate(lastPeriodDate),
      new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    );
  }, [lastPeriodDate]);

  const daysLabel = (n: number) => {
    if (n === 0) return t('오늘');
    if (n > 0) return `D-${n}`;
    return `D+${Math.abs(n)}`;
  };

  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-rose-500 p-6 text-white shadow-bloom">
        <div className="flex items-center justify-between text-sm opacity-90">
          <h2 className="text-sm font-semibold tracking-wide opacity-90">{t('오늘의 리듬')}</h2>
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium tracking-wide">
            BLOOM
          </span>
        </div>
        <div className="mt-1 flex items-end justify-between">
          {prediction.notStartedYet ? (
            <div>
              <p className="text-4xl font-bold">D-{daysUntilUpcomingStart}</p>
              <p className="mt-1 text-sm opacity-90">
                {t('{date} 시작 예정', { date: shortDate(parseLocalDate(lastPeriodDate)) })}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-4xl font-bold">
                {t('{count}일째', { count: prediction.cycleDay })}
                {prediction.cycleDay === 1 && (
                  <span className="ml-2 text-lg font-medium opacity-90">{t('(당일 시작)')}</span>
                )}
              </p>
              <p className="mt-1 text-sm opacity-90">
                {t('주기 {count}일 중', { count: cycleLength })}
                {stats.previousInterval !== null && (
                  <span className="ml-1.5 opacity-85">
                    {t('(직전 주기 {count}일)', { count: stats.previousInterval })}{stats.averageInterval !== null ? ` · ${t('평균 {count}일', { count: stats.averageInterval })}` : ''}
                  </span>
                )}
              </p>
            </div>
          )}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
              prediction.notStartedYet
                ? 'bg-white/20 text-white'
                : phaseStyles[prediction.currentPhase]
            }`}
          >
            {!prediction.notStartedYet && (
              <PhaseEmoji phase={prediction.currentPhase} className="h-4 w-4 shrink-0" />
            )}
            {prediction.notStartedYet ? t('시작 전') : t(prediction.currentPhase)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <InfoCard
          label={t('다음 생리 예정일')}
          accent="text-red-600 dark:text-red-400"
          headline={fullDate(prediction.nextPeriodStart)}
          sub={`${daysLabel(prediction.daysUntilNextPeriod)}, ~${shortDate(
            prediction.nextPeriodEnd,
          )}`}
          icon={<DropOfBlood className="h-5 w-5" focusable="false" />}
        />
        <InfoCard
          label={t('배란 예정일')}
          accent="text-purple-600 dark:text-purple-400"
          headline={fullDate(prediction.ovulationDate)}
          sub={daysLabel(prediction.daysUntilOvulation)}
          icon={<Blossom className="h-5 w-5" focusable="false" />}
        />
        <InfoCard
          label={t('가임기')}
          accent="text-emerald-600 dark:text-emerald-400"
          headline={`${shortDate(
            prediction.fertileWindowStart,
          )} ~ ${shortDate(prediction.fertileWindowEnd)}`}
          sub={t('배란일 전 5일 + 다음날')}
          icon={<Seedling className="h-5 w-5" focusable="false" />}
        />
        <InfoCard
          label={t('안전기 (대략)')}
          accent="text-blue-600 dark:text-blue-400"
          headline={`${shortDate(
            prediction.nextPeriodStart,
          )} ${t('이후')}`}
          sub={t('개인차 있음, 참고용')}
          icon={<Shield className="h-5 w-5" focusable="false" />}
        />
      </div>
      <p className="px-2 text-center text-xs text-gray-400 dark:text-stone-400">
        {t('생리 시작 당일(1일차)부터 주기가 시작되며, 28일 주기는 시작일로부터 28일간 유지되고 다음 생리 예정일은 29일째 날이에요.')}
      </p>
    </section>
  );
}

interface InfoCardProps {
  label: string;
  headline: string;
  sub: string;
  accent: string;
  icon?: ReactNode;
}

function InfoCard({ label, headline, sub, accent, icon }: InfoCardProps) {
  return (
    <div className="rounded-2xl bg-white/90 p-4 shadow-petal ring-1 ring-primary-100/50 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-bloom sm:p-5 dark:bg-stone-900/90 dark:ring-stone-800 dark:shadow-none">
      <div className="flex items-center justify-between gap-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs dark:text-stone-400">
          {label}
        </p>
        {icon && <span className="shrink-0">{icon}</span>}
      </div>
      <p
        className={`mt-1.5 text-sm font-semibold leading-snug sm:mt-2 sm:text-base ${accent}`}
      >
        {headline}
      </p>
      <p className="mt-1 text-[11px] text-gray-400 sm:text-xs dark:text-stone-400">{sub}</p>
    </div>
  );
}
