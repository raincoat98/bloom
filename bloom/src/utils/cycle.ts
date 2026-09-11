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

export function calculateCycle(
  lastPeriodDateStr: string,
  cycleLength: number,
  periodLength: number,
  todayDate: Date = new Date(),
): CyclePrediction {
  const lastPeriodDate = new Date(lastPeriodDateStr);

  const today = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth(),
    todayDate.getDate(),
  );

  const daysSinceStart = differenceInCalendarDays(today, lastPeriodDate);
  const notStartedYet = daysSinceStart < 0;

  if (notStartedYet) {
    const upcomingCycleStart = lastPeriodDate;
    const nextPeriodStart = addDays(upcomingCycleStart, cycleLength);
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
