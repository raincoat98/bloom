import type { CyclePrediction } from '../utils/cycle';

export type Phase = CyclePrediction['currentPhase'];

export interface Supplement {
  name: string;
  desc: string;
}

export interface PhaseGuide {
  /** 콘텐츠상의 시기 이름 (예: 월경 기간) */
  title: string;
  emoji: string;
  /** 한두 줄의 시기 설명 */
  summary: string[];
  /** 추천 음식 */
  foods: string[];
  /** 추천 영양제 */
  supplements: Supplement[];
  /** 성욕 변화 (없을 수 있음) */
  libido?: string;
  /** 파트너 팁 */
  partnerTip: string;
}

/**
 * 주기 계산이 분류하는 4개 시기(`생리 중`, `여포기`, `배란기`, `황체기`)에
 * 각각의 케어 가이드를 매핑한다. 콘텐츠상의 명칭은 `title`로 따로 노출한다.
 */
export const phaseGuides: Record<Phase, PhaseGuide> = {
  '생리 중': {
    title: '월경 기간',
    emoji: '🩸',
    summary: [
      '몸이 무겁고 피로해지기 쉬운 휴식 기간이에요.',
      '따뜻한 보온과 충분한 수면으로 컨디션을 챙겨주세요.',
    ],
    foods: [
      '따뜻한 허브차',
      '미역국',
      '바나나·견과류',
      '소고기·시금치',
      '다크초콜릿',
    ],
    supplements: [
      { name: '철분제', desc: '혈액 손실 보충 및 빈혈 예방' },
      { name: '마그네슘', desc: '생리통 완화 및 근육 긴장 완화' },
      { name: '비타민 B군', desc: '피로 해소 및 활력 충전' },
      { name: '오메가3', desc: '염증 완화 및 혈액순환 개선' },
    ],
    libido: '호르몬 변화로 성욕이 줄고 몸이 예민해질 수 있어요.',
    partnerTip:
      '따뜻한 온열팩이나 음료를 챙겨주고, 편안히 쉴 수 있게 배려해 주세요.',
  },
  여포기: {
    title: '가임기',
    emoji: '🌱',
    summary: [
      '에스트로겐이 분비되며 컨디션과 활력이 차오르는 시기예요.',
      '새로운 운동이나 활동을 시작하기에 가장 좋아요.',
    ],
    foods: [
      '브로콜리',
      '아보카도',
      '신선한 연어',
      '모둠 견과류',
      '제철 과일',
    ],
    supplements: [
      { name: '엽산', desc: '세포 분열 촉진 및 난자 건강 지원' },
      { name: '비타민 D', desc: '호르몬 균형 및 면역력 강화' },
      { name: '오메가3', desc: '혈류 개선 및 난소 기능 보조' },
      { name: '멀티비타민', desc: '기초 영양 보충 및 컨디션 유지' },
    ],
    libido: '에스트로겐 분비 증가로 성욕과 활력이 자연스럽게 상승해요.',
    partnerTip:
      '활력이 넘치는 시기예요. 야외 데이트나 운동 등 활동적인 시간을 함께해 보세요.',
  },
  배란기: {
    title: '배란일',
    emoji: '🥚',
    summary: [
      '난자가 배출되어 임신 확률이 가장 높은 시기예요.',
      '체온이 약간 오르거나 가벼운 배란통이 있을 수 있어요.',
    ],
    foods: [
      '달걀·닭가슴살',
      '연어 구이',
      '신선한 채소',
      '충분한 미온수',
    ],
    supplements: [
      { name: '비타민 E', desc: '항산화 작용 및 착상 환경 개선' },
      { name: '오메가3', desc: '혈액순환 촉진 및 염증 완화' },
      { name: '아연', desc: '생식 호르몬 밸런스 및 세포 재생' },
      { name: '멀티비타민', desc: '필수 미량 영양소 균형 유지' },
    ],
    libido: '호르몬 분비가 정점에 달해 성욕과 매력도가 한 달 중 가장 활발해요.',
    partnerTip:
      '임신 계획에 맞춰 교감하고, 배란통이 있다면 따뜻하게 살펴주세요.',
  },
  황체기: {
    title: '생리전 증후군',
    emoji: '🌙',
    summary: [
      '프로게스테론 영향으로 붓기나 감정 기복이 나타날 수 있어요.',
      '자극적인 음식과 카페인을 줄이고 안정을 취해 보세요.',
    ],
    foods: [
      '바나나·견과류',
      '통곡물·현미',
      '요구르트·두부',
      '따뜻한 호박차',
    ],
    supplements: [
      { name: '마그네슘', desc: 'PMS 불안 및 근육 긴장 완화' },
      { name: '비타민 B군', desc: '기분 변덕 완화 및 피로 개선' },
      { name: '칼슘', desc: '부종 조절 및 신경 안정' },
      { name: '비타민 E', desc: '가슴 압통 완화 및 항산화 보호' },
    ],
    libido: '호르몬 변화로 성욕이 감소하거나 몸이 나른해질 수 있어요.',
    partnerTip:
      '작은 일에도 예민해질 수 있어요. 다정한 공감과 경청으로 안정을 북돋아 주세요.',
  },
};

export interface SupplyItem {
  emoji: string;
  label: string;
}

/** 생리를 앞두고/지나는 동안 미리 챙겨두면 좋은 준비물 */
export const periodSupplies: SupplyItem[] = [
  { emoji: '💫', label: '생리대 / 탐폰' },
  { emoji: '💊', label: '진통제' },
  { emoji: '🔥', label: '온열팩 / 물주머니' },
  { emoji: '🍫', label: '견과류·초콜릿' },
  { emoji: '🍵', label: '따뜻한 허브차' },
];

export const suppliesTip =
  '파우치에 미리 챙겨두면 갑작스러운 시작에도 당황하지 않고 편안해요.';

/** 준비물 체크리스트를 노출할 시기 */
export const suppliesPhases: Partial<Record<Phase, true>> = {
  황체기: true,
  '생리 중': true,
};
