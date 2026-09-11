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
      '자궁내막이 탈락되어 출혈이 일어나는 시기입니다.',
      '몸이 피로하고 예민해질 수 있으니 충분한 휴식이 필요합니다.',
    ],
    foods: [
      '따뜻한 차',
      '미역국',
      '마그네슘이 풍부한 음식 (견과류, 바나나 등)',
      '철분이 풍부한 음식 (시금치, 소고기, 두부 등)',
      '비타민C',
    ],
    supplements: [
      {
        name: '철분제',
        desc: '월경으로 인한 철분 손실을 보충해주며, 빈혈 예방에 도움을 줍니다.',
      },
      {
        name: '마그네슘',
        desc: '근육 이완, 생리통 완화, 신경 안정에 도움을 줍니다.',
      },
      { name: '비타민B군', desc: '피로 회복과 에너지 대사에 도움을 줍니다.' },
      { name: '오메가3', desc: '염증 완화, 혈액순환 개선에 도움을 줍니다.' },
    ],
    libido:
      '월경 기간에는 호르몬 변화로 인해 성욕이 감소하거나 예민해질 수 있습니다.',
    partnerTip:
      '따뜻한 말 한마디와 배를 살짝 감싸주는 등, 배려와 이해가 필요합니다. 무리한 활동이나 성관계 요구는 피해주세요.',
  },
  여포기: {
    title: '가임기',
    emoji: '🌱',
    summary: [
      '배란일 전후로 임신 가능성이 높은 시기입니다.',
      '건강한 난자와 정자를 위해 영양 섭취에 신경 써주세요.',
    ],
    foods: [
      '엽산이 풍부한 음식 (브로콜리, 아보카도)',
      '견과류',
      '신선한 과일과 채소',
      '연어',
    ],
    supplements: [
      {
        name: '엽산',
        desc: '세포 분열과 성장, 건강한 배아 발달에 필수적입니다.',
      },
      { name: '비타민D', desc: '호르몬 균형과 면역력 강화에 도움을 줍니다.' },
      {
        name: '오메가3',
        desc: '난자와 정자의 질 개선, 염증 완화에 도움을 줍니다.',
      },
      { name: '멀티비타민', desc: '필수 영양소를 고루 보충해줍니다.' },
    ],
    libido:
      '가임기에는 에스트로겐의 영향으로 성욕이 평소보다 증가할 수 있습니다.',
    partnerTip:
      '서로의 컨디션을 존중하며, 임신을 원한다면 건강한 생활습관을 함께 실천해보세요. 대화와 스킨십이 도움이 됩니다.',
  },
  배란기: {
    title: '배란일',
    emoji: '🥚',
    summary: [
      '난자가 배출되어 임신 가능성이 가장 높은 날입니다.',
      '컨디션 관리와 충분한 수분 섭취가 중요합니다.',
    ],
    foods: [
      '단백질이 풍부한 음식 (계란, 닭가슴살, 연어)',
      '수분 보충을 위한 물',
      '과일',
    ],
    supplements: [
      {
        name: '비타민E',
        desc: '항산화 작용, 난자 건강 및 착상 환경 개선에 도움을 줍니다.',
      },
      { name: '오메가3', desc: '염증 완화, 혈액순환 개선에 도움을 줍니다.' },
      { name: '아연', desc: '호르몬 균형과 면역력 강화에 도움을 줍니다.' },
      { name: '멀티비타민', desc: '필수 영양소를 고루 보충해줍니다.' },
    ],
    libido: '배란일 전후로 성욕이 가장 높아질 수 있습니다.',
    partnerTip:
      '이 시기에는 감정이 예민해질 수 있으니, 상대방의 기분을 잘 살피고 따뜻하게 배려해 주세요. 충분한 대화와 스킨십이 도움이 됩니다.',
  },
  황체기: {
    title: '생리전 증후군',
    emoji: '🌙',
    summary: [
      '생리 시작 1-2주 전에 나타나는 신체적, 정서적 증상들입니다.',
      '호르몬 변화로 인해 발생하며, 적절한 관리로 완화할 수 있습니다.',
    ],
    foods: [
      '마그네슘이 풍부한 음식 (견과류, 바나나 등)',
      '칼슘이 풍부한 음식 (요구르트, 치즈, 두부 등)',
      '복합 탄수화물 (통곡물, 현미 등)',
      '오메가3가 풍부한 음식 (연어, 아보카도 등)',
    ],
    supplements: [
      {
        name: '마그네슘',
        desc: '근육 이완, 불안 완화, 수면 개선에 도움을 줍니다.',
      },
      { name: '비타민B군', desc: '에너지 대사와 기분 개선에 도움을 줍니다.' },
      { name: '칼슘', desc: '근육 경련 완화와 뼈 건강에 도움을 줍니다.' },
      {
        name: '비타민E',
        desc: '유방 압통 완화와 항산화 작용에 도움을 줍니다.',
      },
    ],
    partnerTip:
      '이 시기에는 감정이 예민하고 기분 변화가 있을 수 있습니다. 이해와 배려가 필요하며, 따뜻한 말과 함께 스트레스를 덜어주는 것이 도움이 됩니다.',
  },
};

export interface SupplyItem {
  emoji: string;
  label: string;
}

/** 생리를 앞두고/지나는 동안 미리 챙겨두면 좋은 준비물 */
export const periodSupplies: SupplyItem[] = [
  { emoji: '💫', label: '생리대' },
  { emoji: '💊', label: '진통제 (이지엔 이브)' },
  { emoji: '🔥', label: '따뜻한 물주머니' },
  { emoji: '🍫', label: '건강한 간식 (견과류, 다크 초콜릿)' },
  { emoji: '🍵', label: '허브차 (생강차, 카모마일)' },
];

export const suppliesTip =
  '생리 기간에 필요한 물품들을 미리 준비해두면 편안하게 관리할 수 있습니다.';

/** 준비물 체크리스트를 노출할 시기 */
export const suppliesPhases: Partial<Record<Phase, true>> = {
  황체기: true,
  '생리 중': true,
};
