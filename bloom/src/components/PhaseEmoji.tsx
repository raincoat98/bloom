import type { FluentEmojiComponent } from '@fluentui-emoji/react';
import CrescentMoon from '@fluentui-emoji/react/modern/crescent-moon';
import DropOfBlood from '@fluentui-emoji/react/modern/drop-of-blood';
import Blossom from '@fluentui-emoji/react/modern/blossom';
import Seedling from '@fluentui-emoji/react/modern/seedling';
import type { Phase } from '../data/phaseGuides';

const ICON_BY_PHASE: Record<Phase, FluentEmojiComponent> = {
  '생리 중': DropOfBlood,
  여포기: Seedling,
  배란기: Blossom,
  황체기: CrescentMoon,
};

interface PhaseEmojiProps {
  phase: Phase;
  className?: string;
}

export default function PhaseEmoji({ phase, className }: PhaseEmojiProps) {
  const Icon = ICON_BY_PHASE[phase];
  if (!Icon) return null;
  return <Icon className={className} focusable="false" />;
}
