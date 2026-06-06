import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CycleState {
  lastPeriodDate: string;
  cycleLength: number;
  periodLength: number;
  setLastPeriodDate: (date: string) => void;
  setCycleLength: (days: number) => void;
  setPeriodLength: (days: number) => void;
  reset: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export const useCycleStore = create<CycleState>()(
  persist(
    (set) => ({
      lastPeriodDate: today(),
      cycleLength: 28,
      periodLength: 5,
      setLastPeriodDate: (date) => set({ lastPeriodDate: date }),
      setCycleLength: (days) => set({ cycleLength: days }),
      setPeriodLength: (days) => set({ periodLength: days }),
      reset: () =>
        set({
          lastPeriodDate: today(),
          cycleLength: 28,
          periodLength: 5,
        }),
    }),
    { name: 'cycle-storage' },
  ),
);
