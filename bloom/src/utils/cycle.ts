import { addDays, differenceInCalendarDays, format } from 'date-fns';
import { ko } from 'date-fns/locale';

export interface CyclePrediction {
  nextPeriodStart: Date;
  nextPeriodEnd: Date;
  ovulationDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  daysUntilNextPeriod: number;
  daysUntilOvulation: number;
  currentPhase: '생리 중' | '여포기' | '배란기' | '황체기';
  cycleDay: number;
  notStartedYet: boolean;
}

/**
 * YYYY-MM-DD 문자열을 로컬 타임존 자정(00:00:00) Date 객체로 파싱합니다.
 * new Date("YYYY-MM-DD")의 UTC 파싱으로 인한 시간대 오프셋 버그를 방지합니다.
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
}

export interface CycleHistoryItem {
  id: string;
  lastPeriodDate: string;
  cycleLength?: number;
  periodLength?: number;
  savedAt?: string;
}

export interface CycleStats {
  /** 총 유효 기록 수 */
  totalEntries: number;
  /** 계산된 간격 개수 (기록 수 - 1) */
  intervalCount: number;
  /** 직전 주기 간격 (가장 최근 2개 기록 간의 간격 일수, 없으면 null) */
  previousInterval: number | null;
  /** 기록들 간의 실제 평균 간격 (소수점 1자리, 예: 28.3) */
  averageInterval: number | null;
  /** 반올림된 평균 간격 (정수 일수, 예: 28) */
  roundedAverageInterval: number | null;
  /** 최소 주기 간격 (일) */
  minInterval: number | null;
  /** 최대 주기 간격 (일) */
  maxInterval: number | null;
  /** 각 기록의 직전 과거 기록과의 간격 맵: entry id -> 일수 (첫 기록은 null) */
  intervalsByEntryId: Record<string, number | null>;
  /** 각 기록의 설정 주기와의 차이 (실제 간격 - entry.cycleLength) */
  diffsByEntryId: Record<string, number | null>;
}

/**
 * 주기 기록 목록으로부터 주기 간격(Interval), 이전 주기(Previous Cycle), 평균 주기(Average Cycle) 통계를 계산합니다.
 */
export function calculateCycleStats(history: CycleHistoryItem[]): CycleStats {
  if (!history || history.length === 0) {
    return {
      totalEntries: 0,
      intervalCount: 0,
      previousInterval: null,
      averageInterval: null,
      roundedAverageInterval: null,
      minInterval: null,
      maxInterval: null,
      intervalsByEntryId: {},
      diffsByEntryId: {},
    };
  }

  // 날짜 내림차순(최신순) 정렬
  const sorted = [...history].sort((a, b) => b.lastPeriodDate.localeCompare(a.lastPeriodDate));

  const intervalsByEntryId: Record<string, number | null> = {};
  const diffsByEntryId: Record<string, number | null> = {};
  const validIntervals: number[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const nextOlder = sorted[i + 1];

    if (!nextOlder) {
      // 가장 오래된 기록은 비교할 이전 주기 기록이 없음 (기준점)
      intervalsByEntryId[current.id] = null;
      diffsByEntryId[current.id] = null;
      continue;
    }

    const currentDate = parseLocalDate(current.lastPeriodDate);
    const olderDate = parseLocalDate(nextOlder.lastPeriodDate);
    const intervalDays = differenceInCalendarDays(currentDate, olderDate);

    if (intervalDays > 0) {
      intervalsByEntryId[current.id] = intervalDays;
      if (typeof current.cycleLength === 'number') {
        diffsByEntryId[current.id] = intervalDays - current.cycleLength;
      } else {
        diffsByEntryId[current.id] = null;
      }
      validIntervals.push(intervalDays);
    } else {
      intervalsByEntryId[current.id] = null;
      diffsByEntryId[current.id] = null;
    }
  }

  if (validIntervals.length === 0) {
    return {
      totalEntries: sorted.length,
      intervalCount: 0,
      previousInterval: null,
      averageInterval: null,
      roundedAverageInterval: null,
      minInterval: null,
      maxInterval: null,
      intervalsByEntryId,
      diffsByEntryId,
    };
  }

  const sum = validIntervals.reduce((acc, val) => acc + val, 0);
  const avg = sum / validIntervals.length;
  const previousInterval = validIntervals[0] ?? null;
  const minInterval = Math.min(...validIntervals);
  const maxInterval = Math.max(...validIntervals);

  return {
    totalEntries: sorted.length,
    intervalCount: validIntervals.length,
    previousInterval,
    averageInterval: Math.round(avg * 10) / 10,
    roundedAverageInterval: Math.round(avg),
    minInterval,
    maxInterval,
    intervalsByEntryId,
    diffsByEntryId,
  };
}

export function calculateCycle(
  lastPeriodDateStr: string,
  cycleLength: number,
  periodLength: number,
  todayDate: Date = new Date(),
): CyclePrediction {
  const lastPeriodDate = parseLocalDate(lastPeriodDateStr);

  const today = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth(),
    todayDate.getDate(),
    0,
    0,
    0,
    0,
  );

  const daysSinceStart = differenceInCalendarDays(today, lastPeriodDate);
  const notStartedYet = daysSinceStart < 0;

  if (notStartedYet) {
    // 시작일이 미래 날짜인 경우: 가장 가까운 다가오는 생리 예정일은 지정한 날짜 자체
    const nextPeriodStart = lastPeriodDate;
    const nextPeriodEnd = addDays(nextPeriodStart, periodLength - 1);
    const ovulationDate = addDays(nextPeriodStart, -14);
    const fertileWindowStart = addDays(ovulationDate, -5);
    const fertileWindowEnd = addDays(ovulationDate, 1);
    const daysUntilNextPeriod = differenceInCalendarDays(nextPeriodStart, today);
    const daysUntilOvulation = differenceInCalendarDays(ovulationDate, today);

    return {
      nextPeriodStart,
      nextPeriodEnd,
      ovulationDate,
      fertileWindowStart,
      fertileWindowEnd,
      daysUntilNextPeriod,
      daysUntilOvulation,
      currentPhase: '황체기',
      cycleDay: 0,
      notStartedYet: true,
    };
  }

  // 생리 시작 당일은 1일차 (daysSinceStart = 0 -> cycleDay = 1)
  // 28일 주기라면 1일차~28일차가 한 주기이며, 다음 주기는 29일째 날 (시작일 + 28일)
  const cyclesElapsed = Math.floor(daysSinceStart / cycleLength);
  const cycleDay = daysSinceStart - cyclesElapsed * cycleLength + 1;

  const currentCycleStart = addDays(lastPeriodDate, cyclesElapsed * cycleLength);
  const nextPeriodStart = addDays(currentCycleStart, cycleLength);
  const nextPeriodEnd = addDays(nextPeriodStart, periodLength - 1);
  const ovulationDate = addDays(nextPeriodStart, -14);
  const fertileWindowStart = addDays(ovulationDate, -5);
  const fertileWindowEnd = addDays(ovulationDate, 1);

  const daysUntilNextPeriod = differenceInCalendarDays(nextPeriodStart, today);
  const daysUntilOvulation = differenceInCalendarDays(ovulationDate, today);

  let currentPhase: CyclePrediction['currentPhase'];
  if (cycleDay <= periodLength) {
    currentPhase = '생리 중';
  } else if (today >= fertileWindowStart && today <= fertileWindowEnd) {
    currentPhase = '배란기';
  } else if (cycleDay < cycleLength - 14) {
    currentPhase = '여포기';
  } else {
    currentPhase = '황체기';
  }

  return {
    nextPeriodStart,
    nextPeriodEnd,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    daysUntilNextPeriod,
    daysUntilOvulation,
    currentPhase,
    cycleDay,
    notStartedYet: false,
  };
}

export function formatDate(date: Date): string {
  return format(date, 'yyyy년 M월 d일 (EEE)', { locale: ko });
}

export function formatShortDate(date: Date): string {
  return format(date, 'M월 d일', { locale: ko });
}
