import type { FluentEmojiComponent } from '@fluentui-emoji/react';
import AdhesiveBandage from '@fluentui-emoji/react/modern/adhesive-bandage';
import Balloon from '@fluentui-emoji/react/modern/balloon';
import FaceSavoringFood from '@fluentui-emoji/react/modern/face-savoring-food';
import FaceWithHeadBandage from '@fluentui-emoji/react/modern/face-with-head-bandage';
import NauseatedFace from '@fluentui-emoji/react/modern/nauseated-face';
import PerformingArts from '@fluentui-emoji/react/modern/performing-arts';
import PersonInBedDefault from '@fluentui-emoji/react/modern/person-in-bed-default';
import WearyFace from '@fluentui-emoji/react/modern/weary-face';
import type { SymptomId } from '../data/symptoms';

const ICON_BY_SYMPTOM: Record<SymptomId, FluentEmojiComponent> = {
  cramps: NauseatedFace,
  headache: FaceWithHeadBandage,
  fatigue: WearyFace,
  bloating: Balloon,
  'mood-swings': PerformingArts,
  backache: PersonInBedDefault,
  'skin-trouble': AdhesiveBandage,
  cravings: FaceSavoringFood,
};

interface SymptomEmojiProps {
  symptom: SymptomId;
  className?: string;
}

export default function SymptomEmoji({ symptom, className }: SymptomEmojiProps) {
  const Icon = ICON_BY_SYMPTOM[symptom];
  return <Icon className={className} focusable="false" />;
}
