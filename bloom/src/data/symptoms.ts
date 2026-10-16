export const SYMPTOM_IDS = [
  'cramps',
  'headache',
  'fatigue',
  'bloating',
  'mood-swings',
  'backache',
  'skin-trouble',
  'cravings',
] as const;

export type SymptomId = (typeof SYMPTOM_IDS)[number];

export const SYMPTOM_BY_ID: Record<SymptomId, { label: string }> = {
  cramps: { label: '복통' },
  headache: { label: '두통' },
  fatigue: { label: '피로' },
  bloating: { label: '더부룩함' },
  'mood-swings': { label: '기분 변화' },
  backache: { label: '허리 통증' },
  'skin-trouble': { label: '피부 트러블' },
  cravings: { label: '식욕 증가' },
};
