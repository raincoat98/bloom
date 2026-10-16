export interface CycleMathResult {
  nextPeriodStart: string; // YYYY-MM-DD
  daysUntilNextPeriod: number;
  fertileWindowStart: string; // YYYY-MM-DD
  daysUntilFertileWindow: number;
}

export function parseUtcDate(dateStr: string): Date {
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatUtcDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addUtcDays(date: Date, days: number): Date {
  const res = new Date(date.getTime());
  res.setUTCDate(res.getUTCDate() + days);
  return res;
}

export function diffCalendarDays(a: Date, b: Date): number {
  const msPerDay = 86_400_000;
  return Math.round((a.getTime() - b.getTime()) / msPerDay);
}

export function evaluateCycle(
  lastPeriodDateStr: string,
  cycleLength: number,
  targetDateStr: string,
): CycleMathResult {
  const lastPeriodDate = parseUtcDate(lastPeriodDateStr);
  const targetDate = parseUtcDate(targetDateStr);

  const daysSinceStart = diffCalendarDays(targetDate, lastPeriodDate);

  let currentCycleStart: Date;
  if (daysSinceStart < 0) {
    currentCycleStart = lastPeriodDate;
  } else {
    const cyclesElapsed = Math.floor(daysSinceStart / cycleLength);
    currentCycleStart = addUtcDays(lastPeriodDate, cyclesElapsed * cycleLength);
  }

  const nextPeriodStart = addUtcDays(currentCycleStart, cycleLength);
  const ovulationDate = addUtcDays(nextPeriodStart, -14);
  const fertileWindowStart = addUtcDays(ovulationDate, -5);

  const daysUntilNextPeriod = diffCalendarDays(nextPeriodStart, targetDate);
  const daysUntilFertileWindow = diffCalendarDays(fertileWindowStart, targetDate);

  return {
    nextPeriodStart: formatUtcDate(nextPeriodStart),
    daysUntilNextPeriod,
    fertileWindowStart: formatUtcDate(fertileWindowStart),
    daysUntilFertileWindow,
  };
}

export function getTodayKst(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return formatUtcDate(kst);
}
