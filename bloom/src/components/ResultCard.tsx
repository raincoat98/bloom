import { useMemo, type ReactNode } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import DropOfBlood from '@fluentui-emoji/react/modern/drop-of-blood';
import Egg from '@fluentui-emoji/react/modern/egg';
import Seedling from '@fluentui-emoji/react/modern/seedling';
import Shield from '@fluentui-emoji/react/modern/shield';
import { useCycleStore } from '../store/cycleStore';
import { calculateCycle, formatDate, formatShortDate } from '../utils/cycle';
import PhaseEmoji from './PhaseEmoji';
const phaseStyles: Record<string, string> = {
  '생리 중': 'bg-red-100 text-red-700',
  여포기: 'bg-blue-100 text-blue-700',
  배란기: 'bg-green-100 text-green-700',
  황체기: 'bg-amber-100 text-amber-700',
};

export default function ResultCard() {
  const { lastPeriodDate, cycleLength, periodLength } = useCycleStore();

  const prediction = useMemo(
    () => calculateCycle(lastPeriodDate, cycleLength, periodLength),
    [lastPeriodDate, cycleLength, periodLength],
  );

  const daysUntilUpcomingStart = useMemo(() => {
    const today = new Date();
    return differenceInCalendarDays(
      new Date(lastPeriodDate),
      new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    );
  }, [lastPeriodDate]);

  const daysLabel = (n: number) => {
    if (n === 0) return '오늘';
    if (n > 0) return `D-${n}`;
    return `D+${Math.abs(n)}`;
  };

  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-rose-500 p-6 text-white shadow-bloom">
        <div className="flex items-center justify-between text-sm opacity-90">
          <h2 className="text-sm font-semibold tracking-wide opacity-90">오늘의 리듬</h2>
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium tracking-wide">
            BLOOM
          </span>
        </div>
        <div className="mt-1 flex items-end justify-between">
          {prediction.notStartedYet ? (
            <div>
              <p className="text-4xl font-bold">D-{daysUntilUpcomingStart}</p>
              <p className="mt-1 text-sm opacity-90">
                {formatShortDate(new Date(lastPeriodDate))} 시작 예정
              </p>
            </div>
          ) : (
            <div>
              <p className="text-4xl font-bold">{prediction.cycleDay}일째</p>
              <p className="mt-1 text-sm opacity-90">
                주기 {cycleLength}일 중
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
            {prediction.notStartedYet ? '시작 전' : prediction.currentPhase}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <InfoCard
          label="다음 생리 예정일"
          accent="text-red-600"
          headline={formatDate(prediction.nextPeriodStart)}
          sub={`${daysLabel(prediction.daysUntilNextPeriod)}, ~${formatShortDate(
            prediction.nextPeriodEnd,
          )}`}
          icon={<DropOfBlood className="h-5 w-5" focusable="false" />}
        />
        <InfoCard
          label="배란 예정일"
          accent="text-green-600"
          headline={formatDate(prediction.ovulationDate)}
          sub={daysLabel(prediction.daysUntilOvulation)}
          icon={<Egg className="h-5 w-5" focusable="false" />}
        />
        <InfoCard
          label="가임기"
          accent="text-emerald-600"
          headline={`${formatShortDate(
            prediction.fertileWindowStart,
          )} ~ ${formatShortDate(prediction.fertileWindowEnd)}`}
          sub="배란일 전 5일 + 다음날"
          icon={<Seedling className="h-5 w-5" focusable="false" />}
        />
        <InfoCard
          label="안전기 (대략)"
          accent="text-blue-600"
          headline={`${formatShortDate(
            prediction.nextPeriodStart,
          )} 이후`}
          sub="개인차 있음, 참고용"
          icon={<Shield className="h-5 w-5" focusable="false" />}
        />
      </div>
      <p className="px-2 text-center text-xs text-gray-400">
        Bloom의 예측은 평균 주기를 바탕으로 한 안내예요. 몸이 보내는 신호를
        함께 살피고, 의료 상담은 전문가와 나누어 주세요.
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
    <div className="rounded-2xl bg-white/90 p-4 shadow-petal ring-1 ring-primary-100/50 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-bloom sm:p-5">
      <div className="flex items-center justify-between gap-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">
          {label}
        </p>
        {icon && <span className="shrink-0">{icon}</span>}
      </div>
      <p
        className={`mt-1.5 text-sm font-semibold leading-snug sm:mt-2 sm:text-base ${accent}`}
      >
        {headline}
      </p>
      <p className="mt-1 text-[11px] text-gray-400 sm:text-xs">{sub}</p>
    </div>
  );
}
