export const SYMPTOM_IDS = [
  'cramps',
  'headache',
  'fatigue',
  'bloating',
  'mood-swings',
  'backache',
  'skin-trouble',
  'cravings',
  'good',
  'energetic',
  'happy',
  'calm',
] as const;

export type SymptomId = (typeof SYMPTOM_IDS)[number];

export const SYMPTOM_BY_ID: Record<SymptomId, { label: string; kind: 'symptom' | 'mood' }> = {
  cramps: { label: '복통', kind: 'symptom' },
  headache: { label: '두통', kind: 'symptom' },
  fatigue: { label: '피로', kind: 'symptom' },
  bloating: { label: '더부룩함', kind: 'symptom' },
  'mood-swings': { label: '기분 변화', kind: 'symptom' },
  backache: { label: '허리 통증', kind: 'symptom' },
  'skin-trouble': { label: '피부 트러블', kind: 'symptom' },
  cravings: { label: '식욕 증가', kind: 'symptom' },
  good: { label: '기분 좋음', kind: 'mood' },
  energetic: { label: '활력', kind: 'mood' },
  happy: { label: '행복', kind: 'mood' },
  calm: { label: '평온', kind: 'mood' },
};
