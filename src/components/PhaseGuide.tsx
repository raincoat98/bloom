import { useMemo, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCycleStore } from '../store/cycleStore';
import { calculateCycle } from '../utils/cycle';
import {
  phaseGuides,
  periodSupplies,
  suppliesPhases,
  suppliesTip,
  type Phase,
} from '../data/phaseGuides';

interface PhaseAccent {
  badge: string;
  chip: string;
  bullet: string;
}

const phaseAccent: Record<Phase, PhaseAccent> = {
  '생리 중': {
    badge: 'bg-red-100 text-red-700',
    chip: 'bg-red-50 text-red-700 ring-red-100',
    bullet: 'text-red-400',
  },
  여포기: {
    badge: 'bg-blue-100 text-blue-700',
    chip: 'bg-blue-50 text-blue-700 ring-blue-100',
    bullet: 'text-blue-400',
  },
  배란기: {
    badge: 'bg-green-100 text-green-700',
    chip: 'bg-green-50 text-green-700 ring-green-100',
    bullet: 'text-green-400',
  },
  황체기: {
    badge: 'bg-amber-100 text-amber-700',
    chip: 'bg-amber-50 text-amber-700 ring-amber-100',
    bullet: 'text-amber-400',
  },
};

export default function PhaseGuide() {
  const { lastPeriodDate, cycleLength, periodLength } = useCycleStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const phase = useMemo(
    () =>
      calculateCycle(lastPeriodDate, cycleLength, periodLength).currentPhase,
    [lastPeriodDate, cycleLength, periodLength],
  );

  const guide = phaseGuides[phase];
  const accent = phaseAccent[phase];
  const showSupplies = Boolean(suppliesPhases[phase]);

  return (
    <section className="mt-6 rounded-3xl bg-white/90 p-6 shadow-petal ring-1 ring-primary-100/50 backdrop-blur sm:p-8">
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        aria-expanded={isExpanded}
        className="flex w-full items-start gap-3 text-left"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-2xl">
          {guide.emoji}
        </span>
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              오늘의 케어
            </p>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-gray-900">
                {guide.title}
              </h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${accent.badge}`}
              >
                {phase}
              </span>
            </div>
          </div>
          <div className="space-y-1 text-sm leading-relaxed text-gray-600">
            {guide.summary.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
        <ChevronDown
          aria-hidden="true"
          size={20}
          strokeWidth={2.25}
          style={{ color: 'oklch(26.2% 0.051 172.552)' }}
          className={`mt-3 shrink-0 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-6">
          <GuideBlock icon="🍽️" title="추천 음식">
            <div className="flex flex-wrap gap-2">
              {guide.foods.map((food) => (
                <span
                  key={food}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${accent.chip}`}
                >
                  {food}
                </span>
              ))}
            </div>
          </GuideBlock>

          <GuideBlock icon="💊" title="추천 영양제">
            <ul className="space-y-2.5">
              {guide.supplements.map((s) => (
                <li key={s.name} className="flex gap-2 text-sm leading-relaxed">
                  <span className={`mt-1 shrink-0 ${accent.bullet}`}>●</span>
                  <span className="text-gray-600">
                    <span className="font-semibold text-gray-800">{s.name}</span>
                    {' — '}
                    {s.desc}
                  </span>
                </li>
              ))}
            </ul>
          </GuideBlock>

          {guide.libido && (
            <GuideBlock icon="💗" title="성욕 변화">
              <p className="rounded-2xl bg-rose-50/70 p-4 text-sm leading-relaxed text-gray-600">
                {guide.libido}
              </p>
            </GuideBlock>
          )}

          <GuideBlock icon="🤝" title="파트너 팁">
            <p className="rounded-2xl bg-primary-50/60 p-4 text-sm leading-relaxed text-gray-700">
              {guide.partnerTip}
            </p>
          </GuideBlock>

          {showSupplies && (
            <GuideBlock icon="🧺" title="준비물">
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {periodSupplies.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-2.5 rounded-2xl bg-sand-50 px-3.5 py-2.5 text-sm text-gray-700 ring-1 ring-sand-200/70"
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex gap-2 rounded-2xl bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-800">
                <span aria-hidden="true">💡</span>
                <span>{suppliesTip}</span>
              </p>
            </GuideBlock>
          )}
        </div>
      )}
    </section>
  );
}

interface GuideBlockProps {
  icon: string;
  title: string;
  children: ReactNode;
}

function GuideBlock({ icon, title, children }: GuideBlockProps) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        <span aria-hidden="true">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}
