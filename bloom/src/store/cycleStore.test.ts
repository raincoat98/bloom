import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ApiModule from '../lib/api';
import { useCycleStore } from './cycleStore';

const mocks = vi.hoisted(() => ({
  upsert: vi.fn().mockResolvedValue({ record: {} }),
  remove: vi.fn().mockResolvedValue(undefined),
  list: vi.fn().mockResolvedValue([]),
}));

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('../lib/api');
  return {
    ...actual,
    cycleApi: {
      ...actual.cycleApi,
      upsert: mocks.upsert,
      remove: mocks.remove,
      list: mocks.list,
    },
  };
});

describe('useCycleStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useCycleStore.setState({
      lastPeriodDate: '2026-10-01',
      cycleLength: 28,
      periodLength: 5,
      history: [],
      remoteStatus: 'local',
    });
    vi.clearAllMocks();
  });

  describe('addToHistory', () => {
    it('adds an entry based on current state when called without arguments', () => {
      const entry = useCycleStore.getState().addToHistory();

      expect(entry.lastPeriodDate).toBe('2026-10-01');
      expect(entry.cycleLength).toBe(28);
      expect(entry.periodLength).toBe(5);

      const history = useCycleStore.getState().history;
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe(entry.id);
    });

    it('adds a manual past record with custom parameters and sorts descending', () => {
      useCycleStore.getState().addToHistory(); // 2026-10-01

      const pastEntry = useCycleStore.getState().addToHistory({
        lastPeriodDate: '2026-09-02',
        cycleLength: 29,
        periodLength: 6,
      });

      expect(pastEntry.lastPeriodDate).toBe('2026-09-02');
      expect(pastEntry.cycleLength).toBe(29);
      expect(pastEntry.periodLength).toBe(6);

      const history = useCycleStore.getState().history;
      expect(history).toHaveLength(2);
      expect(history[0].lastPeriodDate).toBe('2026-10-01');
      expect(history[1].lastPeriodDate).toBe('2026-09-02');
      // Active lastPeriodDate remains latest
      expect(useCycleStore.getState().lastPeriodDate).toBe('2026-10-01');
    });

    it('updates active lastPeriodDate when a newer date is manually added', () => {
      useCycleStore.getState().addToHistory(); // 2026-10-01

      useCycleStore.getState().addToHistory({
        lastPeriodDate: '2026-10-30',
        cycleLength: 29,
        periodLength: 5,
      });

      const history = useCycleStore.getState().history;
      expect(history[0].lastPeriodDate).toBe('2026-10-30');
      expect(useCycleStore.getState().lastPeriodDate).toBe('2026-10-30');
    });

    it('updates the entry in-place when adding with an existing date', () => {
      const first = useCycleStore.getState().addToHistory({
        lastPeriodDate: '2026-09-10',
        cycleLength: 28,
        periodLength: 5,
      });

      const updated = useCycleStore.getState().addToHistory({
        lastPeriodDate: '2026-09-10',
        cycleLength: 31,
        periodLength: 6,
      });

      expect(updated.id).toBe(first.id);
      expect(updated.cycleLength).toBe(31);
      expect(updated.periodLength).toBe(6);

      const history = useCycleStore.getState().history;
      expect(history).toHaveLength(1);
      expect(history[0].cycleLength).toBe(31);
    });
  });

  describe('updateHistoryEntry', () => {
    it('updates cycleLength and periodLength while keeping same ID when date is unchanged', () => {
      const entry = useCycleStore.getState().addToHistory({
        lastPeriodDate: '2026-09-15',
        cycleLength: 28,
        periodLength: 5,
      });

      useCycleStore.getState().updateHistoryEntry(entry.id, {
        lastPeriodDate: '2026-09-15',
        cycleLength: 30,
        periodLength: 7,
      });

      const updated = useCycleStore.getState().history.find((h) => h.id === entry.id);
      expect(updated).toBeDefined();
      expect(updated?.cycleLength).toBe(30);
      expect(updated?.periodLength).toBe(7);
      expect(updated?.lastPeriodDate).toBe('2026-09-15');
    });

    it('changes the date, sorts history, and maintains integrity when date is changed', () => {
      const entry1 = useCycleStore.getState().addToHistory({
        lastPeriodDate: '2026-08-01',
        cycleLength: 28,
        periodLength: 5,
      });
      useCycleStore.getState().addToHistory({
        lastPeriodDate: '2026-09-01',
        cycleLength: 28,
        periodLength: 5,
      });

      // Change August entry to late September (newer than entry2)
      useCycleStore.getState().updateHistoryEntry(entry1.id, {
        lastPeriodDate: '2026-09-29',
        cycleLength: 28,
        periodLength: 5,
      });

      const history = useCycleStore.getState().history;
      expect(history).toHaveLength(2);
      expect(history[0].lastPeriodDate).toBe('2026-09-29');
      expect(history[1].lastPeriodDate).toBe('2026-09-01');
      expect(useCycleStore.getState().lastPeriodDate).toBe('2026-09-29');
    });

    it('merges with existing entry if edited date collides with another entry', () => {
      const entryA = useCycleStore.getState().addToHistory({
        lastPeriodDate: '2026-08-01',
        cycleLength: 28,
        periodLength: 5,
      });
      const entryB = useCycleStore.getState().addToHistory({
        lastPeriodDate: '2026-09-01',
        cycleLength: 28,
        periodLength: 5,
      });

      // Edit entryA date to 2026-09-01 (collides with entryB)
      useCycleStore.getState().updateHistoryEntry(entryA.id, {
        lastPeriodDate: '2026-09-01',
        cycleLength: 32,
        periodLength: 6,
      });

      const history = useCycleStore.getState().history;
      expect(history).toHaveLength(1);
      expect(history[0].lastPeriodDate).toBe('2026-09-01');
      expect(history[0].cycleLength).toBe(32);
      expect(history[0].id).toBe(entryB.id);
    });
  });

  describe('removeFromHistory', () => {
    it('removes entry and updates lastPeriodDate to the next most recent entry', () => {
      const entry1 = useCycleStore.getState().addToHistory({
        lastPeriodDate: '2026-10-10',
        cycleLength: 28,
        periodLength: 5,
      });
      const entry2 = useCycleStore.getState().addToHistory({
        lastPeriodDate: '2026-09-10',
        cycleLength: 28,
        periodLength: 5,
      });

      useCycleStore.getState().removeFromHistory(entry1.id);

      const history = useCycleStore.getState().history;
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe(entry2.id);
      expect(useCycleStore.getState().lastPeriodDate).toBe('2026-09-10');
    });
  });
});
