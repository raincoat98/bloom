import { useMemo } from 'react';
import { useCycleStore } from '../store/cycleStore';
import { calculateCycle, formatDate, formatShortDate } from '../utils/cycle';

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

  const daysLabel = (n: number) => {
    if (n === 0) return '오늘';
    if (n > 0) return `D-${n}`;
    return `D+${Math.abs(n)}`;
  };

  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-rose-500 p-6 text-white shadow-bloom">
        <div className="flex items-center justify-between text-sm opacity-90">
          <p>오늘의 리듬</p>
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium tracking-wide">
            BLOOM
          </span>
        </div>
        <div className="mt-1 flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold">{prediction.cycleDay}일째</p>
            <p className="mt-1 text-sm opacity-90">
              주기 {cycleLength}일 중
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              phaseStyles[prediction.currentPhase]
            }`}
          >
            {prediction.currentPhase}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoCard
          label="다음 생리 예정일"
          accent="text-red-600"
          headline={formatDate(prediction.nextPeriodStart)}
          sub={`${daysLabel(prediction.daysUntilNextPeriod)} · ~${formatShortDate(
            prediction.nextPeriodEnd,
          )}`}
        />
        <InfoCard
          label="배란 예정일"
          accent="text-green-600"
          headline={formatDate(prediction.ovulationDate)}
          sub={daysLabel(prediction.daysUntilOvulation)}
        />
        <InfoCard
          label="가임기"
          accent="text-emerald-600"
          headline={`${formatShortDate(
            prediction.fertileWindowStart,
          )} ~ ${formatShortDate(prediction.fertileWindowEnd)}`}
          sub="배란일 전 5일 + 다음날"
        />
        <InfoCard
          label="안전기 (대략)"
          accent="text-blue-600"
          headline={`${formatShortDate(
            prediction.nextPeriodStart,
          )} 이후`}
          sub="개인차 있음, 참고용"
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
}

function InfoCard({ label, headline, sub, accent }: InfoCardProps) {
  return (
    <div className="rounded-2xl bg-white/90 p-5 shadow-petal ring-1 ring-primary-100/50 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-bloom">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className={`mt-2 text-base font-semibold ${accent}`}>{headline}</p>
      <p className="mt-1 text-xs text-gray-400">{sub}</p>
    </div>
  );
}
