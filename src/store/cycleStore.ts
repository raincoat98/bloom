import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CycleHistoryEntry {
  id: string;
  lastPeriodDate: string;
  cycleLength: number;
  periodLength: number;
  savedAt: string;
}

export interface CycleState {
  lastPeriodDate: string;
  cycleLength: number;
  periodLength: number;
  history: CycleHistoryEntry[];
  setLastPeriodDate: (date: string) => void;
  setCycleLength: (days: number) => void;
  setPeriodLength: (days: number) => void;
  reset: () => void;
  addToHistory: () => void;
  removeFromHistory: (id: string) => void;
  loadFromHistory: (id: string) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useCycleStore = create<CycleState>()(
  persist(
    (set, get) => ({
      lastPeriodDate: today(),
      cycleLength: 28,
      periodLength: 5,
      history: [],
      setLastPeriodDate: (date) => set({ lastPeriodDate: date }),
      setCycleLength: (days) => set({ cycleLength: days }),
      setPeriodLength: (days) => set({ periodLength: days }),
      reset: () =>
        set({
          lastPeriodDate: today(),
          cycleLength: 28,
          periodLength: 5,
        }),
      addToHistory: () => {
        const { lastPeriodDate, cycleLength, periodLength, history } = get();
        const existing = history.find(
          (item) => item.lastPeriodDate === lastPeriodDate,
        );
        const entry: CycleHistoryEntry = {
          id: existing?.id ?? createId(),
          lastPeriodDate,
          cycleLength,
          periodLength,
          savedAt: new Date().toISOString(),
        };
        const others = existing
          ? history.filter((item) => item.id !== existing.id)
          : history;
        set({ history: [entry, ...others] });
      },
      removeFromHistory: (id) =>
        set({ history: get().history.filter((entry) => entry.id !== id) }),
      loadFromHistory: (id) => {
        const entry = get().history.find((item) => item.id === id);
        if (!entry) return;
        set({
          lastPeriodDate: entry.lastPeriodDate,
          cycleLength: entry.cycleLength,
          periodLength: entry.periodLength,
        });
      },
    }),
    { name: 'cycle-storage' },
  ),
);
