import { useMemo, useState, type ReactNode } from 'react';
import type { FluentEmojiComponent } from '@fluentui-emoji/react';
import ChocolateBar from '@fluentui-emoji/react/modern/chocolate-bar';
import ForkAndKnifeWithPlate from '@fluentui-emoji/react/modern/fork-and-knife-with-plate';
import Handshake from '@fluentui-emoji/react/modern/handshake';
import HotBeverage from '@fluentui-emoji/react/modern/hot-beverage';
import HotSprings from '@fluentui-emoji/react/modern/hot-springs';
import Pill from '@fluentui-emoji/react/modern/pill';
import SparklingHeart from '@fluentui-emoji/react/modern/sparkling-heart';
import Sparkles from '@fluentui-emoji/react/modern/sparkles';
import { ChevronDown } from 'lucide-react';
import { useCycleStore } from '../store/cycleStore';
import { useI18n } from '../i18n';
import { calculateCycle } from '../utils/cycle';
import {
  phaseGuides,
  periodSupplies,
  suppliesPhases,
  suppliesTip,
  type Phase,
} from '../data/phaseGuides';
import PhaseEmoji from './PhaseEmoji';

const SUPPLY_ICONS: Record<string, FluentEmojiComponent> = {
  '생리대 / 탐폰': Sparkles,
  생리대: Sparkles,
  진통제: Pill,
  '진통제 (이지엔 이브)': Pill,
  '온열팩 / 물주머니': HotSprings,
  '따뜻한 물주머니': HotSprings,
  '견과류·초콜릿': ChocolateBar,
  '건강한 간식 (견과류, 다크 초콜릿)': ChocolateBar,
  '따뜻한 허브차': HotBeverage,
  '허브차 (생강차, 카모마일)': HotBeverage,
};

interface PhaseAccent {
  badge: string;
  dot: string;
  chip: string;
}

const phaseAccent: Record<Phase, PhaseAccent> = {
  '생리 중': {
    badge:
      'bg-rose-50 text-rose-700 ring-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800/80',
    dot: 'bg-rose-500',
    chip: 'bg-rose-50 text-rose-700 ring-rose-200/80 hover:bg-rose-100/80 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800/80 dark:hover:bg-rose-900/60',
  },
  여포기: {
    badge:
      'bg-sky-50 text-sky-700 ring-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-800/80',
    dot: 'bg-sky-500',
    chip: 'bg-sky-50 text-sky-700 ring-sky-200/80 hover:bg-sky-100/80 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-800/80 dark:hover:bg-sky-900/60',
  },
  배란기: {
    badge:
      'bg-emerald-50 text-emerald-700 ring-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800/80',
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80 hover:bg-emerald-100/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800/80 dark:hover:bg-emerald-900/60',
  },
  황체기: {
    badge:
      'bg-amber-50 text-amber-700 ring-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800/80',
    dot: 'bg-amber-500',
    chip: 'bg-amber-50 text-amber-700 ring-amber-200/80 hover:bg-amber-100/80 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800/80 dark:hover:bg-amber-900/60',
  },
};

export default function PhaseGuide() {
  const { t } = useI18n();
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
    <section className="mt-6 rounded-3xl bg-white/90 p-5 shadow-petal ring-1 ring-primary-100/50 backdrop-blur sm:p-7 dark:bg-stone-900/90 dark:ring-stone-800 dark:shadow-none">
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        aria-expanded={isExpanded}
        className="group flex w-full items-start gap-3.5 text-left transition-colors"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 shadow-sm ring-1 ring-primary-100/60 transition-transform duration-200 group-hover:scale-105 dark:bg-stone-800 dark:ring-stone-700">
          <PhaseEmoji phase={phase} className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400">
                {t('오늘의 케어')}
              </span>
              <span className="text-xs font-medium text-gray-400 transition-colors group-hover:text-primary-600 dark:text-stone-400 dark:group-hover:text-primary-400">
                {isExpanded ? t('접기') : t('더보기')}
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold tracking-tight text-gray-900 dark:text-white break-keep">
                {t(guide.title)}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${accent.badge}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${accent.dot}`}
                  aria-hidden="true"
                />
                {t(phase)}
              </span>
            </div>
          </div>
          <div className="space-y-0.5 text-sm leading-relaxed text-gray-600 dark:text-stone-300 break-keep">
            {guide.summary.map((line) => (
              <p key={line}>{t(line)}</p>
            ))}
          </div>

          {!isExpanded && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-gray-400 dark:text-stone-400 break-keep">
                {t('추천:')}
              </span>
              {guide.foods.slice(0, 3).map((food) => (
                <span
                  key={food}
                  className="inline-flex items-center rounded-md bg-sand-100/80 px-2 py-0.5 text-[11px] font-medium text-gray-600 ring-1 ring-inset ring-sand-200/60 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700/60 break-keep"
                >
                  {t(food)}
                </span>
              ))}
              {guide.foods.length > 3 && (
                <span className="text-[11px] font-medium text-gray-400 dark:text-stone-400">
                  +{guide.foods.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sand-100 text-gray-500 transition-all duration-200 group-hover:bg-primary-100 group-hover:text-primary-600 dark:bg-stone-800 dark:text-stone-400 dark:group-hover:bg-stone-700 dark:group-hover:text-primary-300">
          <ChevronDown
            aria-hidden="true"
            size={16}
            strokeWidth={2.5}
            className={`transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="mt-5 space-y-4 border-t border-sand-200/60 dark:border-stone-800 pt-5">
          <GuideBlock
            icon={<ForkAndKnifeWithPlate className="h-3.5 w-3.5" focusable="false" />}
            title={t('추천 음식')}
          >
            <div className="flex flex-wrap gap-1.5">
              {guide.foods.map((food) => (
                <span
                  key={food}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset break-keep transition-colors ${accent.chip}`}
                >
                  {t(food)}
                </span>
              ))}
            </div>
          </GuideBlock>

          <GuideBlock
            icon={<Pill className="h-3.5 w-3.5" focusable="false" />}
            title={t('추천 영양제')}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {guide.supplements.map((s) => (
                <div
                  key={s.name}
                  className="flex items-start gap-2.5 rounded-xl bg-sand-50/70 p-2.5 ring-1 ring-sand-200/60 dark:bg-stone-800/60 dark:ring-stone-700/60"
                >
                  <span className="shrink-0 rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-gray-800 shadow-2xs ring-1 ring-gray-200/70 dark:bg-stone-700 dark:text-stone-200 dark:ring-stone-600 break-keep">
                    {t(s.name)}
                  </span>
                  <span className="text-xs leading-relaxed text-gray-600 dark:text-stone-300 break-keep">
                    {t(s.desc)}
                  </span>
                </div>
              ))}
            </div>
          </GuideBlock>

          {guide.libido && (
            <GuideBlock
              icon={<SparklingHeart className="h-3.5 w-3.5" focusable="false" />}
              title={t('몸과 마음의 변화')}
            >
              <p className="rounded-xl bg-rose-50/70 p-3 text-xs leading-relaxed text-gray-700 ring-1 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900/50 break-keep">
                {t(guide.libido)}
              </p>
            </GuideBlock>
          )}

          <GuideBlock
            icon={<Handshake className="h-3.5 w-3.5" focusable="false" />}
            title={t('파트너 케어 팁')}
          >
            <p className="rounded-xl bg-primary-50/60 p-3 text-xs leading-relaxed text-gray-700 ring-1 ring-primary-100/60 dark:bg-primary-950/40 dark:text-primary-200 dark:ring-primary-900/50 break-keep">
              {t(guide.partnerTip)}
            </p>
          </GuideBlock>

          {showSupplies && (
            <GuideBlock
              icon={<Sparkles className="h-3.5 w-3.5" focusable="false" />}
              title={t('주기 케어 준비물')}
            >
              <div className="space-y-2.5">
                <ul className="flex flex-wrap gap-2">
                  {periodSupplies.map((item) => {
                    const Icon = SUPPLY_ICONS[item.label] ?? Sparkles;
                    return (
                      <li
                        key={item.label}
                        className="inline-flex items-center gap-2 rounded-xl bg-sand-50/90 px-3 py-2 text-xs font-medium text-gray-700 ring-1 ring-sand-200/70 shadow-2xs dark:bg-stone-800/80 dark:text-stone-300 dark:ring-stone-700 break-keep"
                      >
                        <Icon className="h-4 w-4 shrink-0" focusable="false" />
                        <span>{t(item.label)}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="flex items-center gap-2 rounded-xl bg-amber-50/70 px-3.5 py-2.5 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-100 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-900/50 break-keep">
                  <span aria-hidden="true" className="shrink-0">
                    💡
                  </span>
                  <span>{t(suppliesTip)}</span>
                </p>
              </div>
            </GuideBlock>
          )}
        </div>
      )}
    </section>
  );
}

interface GuideBlockProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

function GuideBlock({ icon, title, children }: GuideBlockProps) {
  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-stone-200">
        <span
          aria-hidden="true"
          className="flex h-5 w-5 items-center justify-center rounded-md bg-sand-100/80 text-gray-600 dark:bg-stone-800 dark:text-stone-400"
        >
          {icon}
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}
