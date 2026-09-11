import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApiError, cycleApi } from '../lib/api';
import { getAuthToken } from '../lib/token';

export interface CycleHistoryEntry {
  id: string;
  lastPeriodDate: string;
  cycleLength: number;
  periodLength: number;
  savedAt: string;
}

/** 로그인 상태에서 기록이 서버에 얼마나 반영됐는지 나타내는 상태 */
export type RemoteStatus = 'local' | 'syncing' | 'synced' | 'error';

export interface CycleState {
  lastPeriodDate: string;
  cycleLength: number;
  periodLength: number;
  history: CycleHistoryEntry[];
  remoteStatus: RemoteStatus;
  setLastPeriodDate: (date: string) => void;
  setCycleLength: (days: number) => void;
  setPeriodLength: (days: number) => void;
  setRemoteStatus: (status: RemoteStatus) => void;
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

function pushToServer(entry: CycleHistoryEntry) {
  if (!getAuthToken()) return;
  useCycleStore.setState({ remoteStatus: 'syncing' });
  cycleApi
    .upsert(entry)
    .then(() => useCycleStore.setState({ remoteStatus: 'synced' }))
    .catch(() => useCycleStore.setState({ remoteStatus: 'error' }));
}

function removeFromServer(id: string) {
  if (!getAuthToken()) return;
  cycleApi.remove(id).catch((error: unknown) => {
    // 서버에 아직 없는 기록을 지우려 한 경우는 정상 흐름
    if (error instanceof ApiError && error.status === 404) return;
    useCycleStore.setState({ remoteStatus: 'error' });
  });
}

/** 로그인 직후 로컬 기록과 서버 기록을 병합하고, 서버에 없는 기록을 올립니다. */
export async function syncAfterLogin(): Promise<void> {
  const records = await cycleApi.list();
  const { history } = useCycleStore.getState();

  const localByDate = new Map(history.map((entry) => [entry.lastPeriodDate, entry]));
  const serverDates = new Set(records.map((entry) => entry.lastPeriodDate));

  const merged: CycleHistoryEntry[] = records.map((remote) => {
    const local = localByDate.get(remote.lastPeriodDate);
    // 같은 시작일이면 나중에 저장된 쪽이 이긴다 (마지막 수정 기준)
    return local && local.savedAt >= remote.savedAt ? local : remote;
  });
  for (const entry of history) {
    if (!serverDates.has(entry.lastPeriodDate)) merged.push(entry);
  }
  merged.sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
  useCycleStore.setState({ history: merged });

  const toUpload = history.filter((entry) => !serverDates.has(entry.lastPeriodDate));
  if (toUpload.length > 0) {
    useCycleStore.setState({ remoteStatus: 'syncing' });
    await Promise.all(toUpload.map((entry) => cycleApi.upsert(entry)));
  }
  useCycleStore.setState({ remoteStatus: 'synced' });
}

export const useCycleStore = create<CycleState>()(
  persist(
    (set, get) => ({
      lastPeriodDate: today(),
      cycleLength: 28,
      periodLength: 5,
      history: [],
      remoteStatus: 'local',
      setLastPeriodDate: (date) => set({ lastPeriodDate: date }),
      setCycleLength: (days) => set({ cycleLength: days }),
      setPeriodLength: (days) => set({ periodLength: days }),
      setRemoteStatus: (status) => set({ remoteStatus: status }),
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
        pushToServer(entry);
      },
      removeFromHistory: (id) => {
        set({ history: get().history.filter((entry) => entry.id !== id) });
        removeFromServer(id);
      },
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
    { name: 'cycle-storage', partialize: (state) => ({ ...state, remoteStatus: 'local' }) },
  ),
);