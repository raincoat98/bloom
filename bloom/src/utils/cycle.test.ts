import { describe, expect, it } from 'vitest';
import {
  calculateCycle,
  calculateCycleStats,
  formatDate,
  formatShortDate,
  parseLocalDate,
} from './cycle';

describe('cycle calculations and date logic', () => {
  it('parses local dates reliably without UTC timezone shifts', () => {
    const date = parseLocalDate('2026-10-19');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(9); // 0-indexed month (10월)
    expect(date.getDate()).toBe(19);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
  });

  describe('28-day cycle start and day progression', () => {
    const lastPeriod = '2026-10-01';
    const cycleLength = 28;
    const periodLength = 5;

    it('confirms the cycle starts on the exact day (Day 1)', () => {
      // 10월 1일 당일은 1일차여야 함
      const today = parseLocalDate('2026-10-01');
      const pred = calculateCycle(lastPeriod, cycleLength, periodLength, today);

      expect(pred.notStartedYet).toBe(false);
      expect(pred.cycleDay).toBe(1);
      expect(pred.currentPhase).toBe('생리 중');
      // 다음 생리 예정일은 시작일 + 28일 = 10월 29일
      expect(pred.nextPeriodStart.getDate()).toBe(29);
      expect(pred.nextPeriodStart.getMonth()).toBe(9); // 10월
      expect(pred.daysUntilNextPeriod).toBe(28);
    });

    it('correctly tracks the middle and end of period phase', () => {
      // 10월 5일: 5일차 (생리 기간의 마지막 날)
      const day5 = parseLocalDate('2026-10-05');
      const pred5 = calculateCycle(lastPeriod, cycleLength, periodLength, day5);
      expect(pred5.cycleDay).toBe(5);
      expect(pred5.currentPhase).toBe('생리 중');

      // 10월 6일: 6일차 (여포기 진입)
      const day6 = parseLocalDate('2026-10-06');
      const pred6 = calculateCycle(lastPeriod, cycleLength, periodLength, day6);
      expect(pred6.cycleDay).toBe(6);
      expect(pred6.currentPhase).toBe('여포기');
    });

    it('reaches day 28 on the 28th day and advances to day 1 on day 29', () => {
      // 10월 28일: 28일차 (주기의 마지막 날)
      const day28 = parseLocalDate('2026-10-28');
      const pred28 = calculateCycle(lastPeriod, cycleLength, periodLength, day28);
      expect(pred28.cycleDay).toBe(28);
      expect(pred28.daysUntilNextPeriod).toBe(1);

      // 10월 29일: 다음 주기의 1일차 시작 (새 주기)
      const day29 = parseLocalDate('2026-10-29');
      const pred29 = calculateCycle(lastPeriod, cycleLength, periodLength, day29);
      expect(pred29.cycleDay).toBe(1);
      expect(pred29.currentPhase).toBe('생리 중');
      // 다음 예정일은 10월 29일 + 28일 = 11월 26일
      expect(pred29.nextPeriodStart.getDate()).toBe(26);
      expect(pred29.nextPeriodStart.getMonth()).toBe(10); // 11월
    });
  });

  describe('future date input (notStartedYet)', () => {
    it('sets nextPeriodStart to the future input date directly', () => {
      // 오늘 10월 19일, 사용자가 10월 25일로 지정한 경우
      const today = parseLocalDate('2026-10-19');
      const pred = calculateCycle('2026-10-25', 28, 5, today);

      expect(pred.notStartedYet).toBe(true);
      expect(pred.cycleDay).toBe(0);
      expect(pred.daysUntilNextPeriod).toBe(6);
      expect(pred.nextPeriodStart.getDate()).toBe(25);
      expect(pred.nextPeriodStart.getMonth()).toBe(9); // 10월
    });
  });

  describe('calculateCycleStats (interval, previous cycle, average cycle)', () => {
    it('returns empty stats for empty history', () => {
      const stats = calculateCycleStats([]);
      expect(stats.totalEntries).toBe(0);
      expect(stats.intervalCount).toBe(0);
      expect(stats.previousInterval).toBeNull();
      expect(stats.averageInterval).toBeNull();
      expect(stats.roundedAverageInterval).toBeNull();
    });

    it('returns null intervals for single entry', () => {
      const stats = calculateCycleStats([
        { id: '1', lastPeriodDate: '2026-10-01', cycleLength: 28, periodLength: 5 },
      ]);
      expect(stats.totalEntries).toBe(1);
      expect(stats.intervalCount).toBe(0);
      expect(stats.previousInterval).toBeNull();
      expect(stats.averageInterval).toBeNull();
      expect(stats.intervalsByEntryId['1']).toBeNull();
    });

    it('calculates interval and previous cycle correctly for two entries', () => {
      const history = [
        { id: 'recent', lastPeriodDate: '2026-10-01', cycleLength: 28 },
        { id: 'older', lastPeriodDate: '2026-09-03', cycleLength: 28 }, // 28일 차이
      ];
      const stats = calculateCycleStats(history);

      expect(stats.totalEntries).toBe(2);
      expect(stats.intervalCount).toBe(1);
      expect(stats.previousInterval).toBe(28);
      expect(stats.averageInterval).toBe(28);
      expect(stats.roundedAverageInterval).toBe(28);
      expect(stats.minInterval).toBe(28);
      expect(stats.maxInterval).toBe(28);
      expect(stats.intervalsByEntryId['recent']).toBe(28);
      expect(stats.diffsByEntryId['recent']).toBe(0); // 28 - 28 = 0
      expect(stats.intervalsByEntryId['older']).toBeNull();
    });

    it('calculates average cycle, min/max and differences for multiple entries', () => {
      // 간격들:
      // 10-01 ~ 09-03: 28일
      // 09-03 ~ 08-05: 29일
      // 08-05 ~ 07-08: 28일
      // 평균 = (28 + 29 + 28) / 3 = 28.333... -> 28.3
      const history = [
        { id: 'e1', lastPeriodDate: '2026-10-01', cycleLength: 28 },
        { id: 'e2', lastPeriodDate: '2026-09-03', cycleLength: 28 },
        { id: 'e3', lastPeriodDate: '2026-08-05', cycleLength: 30 },
        { id: 'e4', lastPeriodDate: '2026-07-08', cycleLength: 28 },
      ];
      const stats = calculateCycleStats(history);

      expect(stats.totalEntries).toBe(4);
      expect(stats.intervalCount).toBe(3);
      expect(stats.previousInterval).toBe(28); // 가장 최근 주기 간격
      expect(stats.averageInterval).toBe(28.3);
      expect(stats.roundedAverageInterval).toBe(28);
      expect(stats.minInterval).toBe(28);
      expect(stats.maxInterval).toBe(29);
      expect(stats.intervalsByEntryId['e1']).toBe(28);
      expect(stats.intervalsByEntryId['e2']).toBe(29);
      expect(stats.diffsByEntryId['e2']).toBe(1); // 29 - 28 = +1일
      expect(stats.intervalsByEntryId['e3']).toBe(28);
      expect(stats.diffsByEntryId['e3']).toBe(-2); // 28 - 30 = -2일
      expect(stats.intervalsByEntryId['e4']).toBeNull();
    });

    it('handles unordered history gracefully', () => {
      const history = [
        { id: 'e2', lastPeriodDate: '2026-09-03', cycleLength: 28 },
        { id: 'e4', lastPeriodDate: '2026-07-08', cycleLength: 28 },
        { id: 'e1', lastPeriodDate: '2026-10-01', cycleLength: 28 },
        { id: 'e3', lastPeriodDate: '2026-08-05', cycleLength: 28 },
      ];
      const stats = calculateCycleStats(history);

      expect(stats.previousInterval).toBe(28);
      expect(stats.averageInterval).toBe(28.3);
      expect(stats.intervalsByEntryId['e1']).toBe(28);
      expect(stats.intervalsByEntryId['e2']).toBe(29);
    });
  });

  describe('formatting functions', () => {
    it('formats full date in Korean with weekday', () => {
      const date = parseLocalDate('2026-10-19');
      expect(formatDate(date)).toMatch(/2026년 10월 19일 \(.+\)/);
    });

    it('formats short date in Korean', () => {
      const date = parseLocalDate('2026-10-19');
      expect(formatShortDate(date)).toBe('10월 19일');
    });
  });
});
