import { format } from 'date-fns';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SymptomId } from '../data/symptoms';
import { ApiError, symptomApi } from '../lib/api';
import { getAuthToken } from '../lib/token';

export interface SymptomLog {
  id: string;
  logDate: string;
  symptoms: SymptomId[];
  savedAt: string;
}

type RemoteStatus = 'local' | 'syncing' | 'synced' | 'error';

interface SymptomState {
  logDate: string;
  symptoms: SymptomId[];
  logs: SymptomLog[];
  remoteStatus: RemoteStatus;
  setLogDate: (date: string) => void;
  toggleSymptom: (symptom: SymptomId) => void;
  saveLog: () => void;
  removeLog: (id: string) => void;
  removeSymptomFromLog: (id: string, symptom: SymptomId) => void;
  setRemoteStatus: (status: RemoteStatus) => void;
}

export const getTodayDateString = () => format(new Date(), 'yyyy-MM-dd');

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function pushToServer(entry: SymptomLog) {
  if (!getAuthToken()) return;
  useSymptomStore.setState({ remoteStatus: 'syncing' });
  symptomApi
    .upsert(entry)
    .then(() => useSymptomStore.setState({ remoteStatus: 'synced' }))
    .catch(() => useSymptomStore.setState({ remoteStatus: 'error' }));
}

function removeFromServer(id: string) {
  if (!getAuthToken()) return;
  symptomApi.remove(id).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) return;
    useSymptomStore.setState({ remoteStatus: 'error' });
  });
}

export async function syncSymptomsAfterLogin(): Promise<void> {
  const records = await symptomApi.list();
  const { logs } = useSymptomStore.getState();
  const localByDate = new Map(logs.map((entry) => [entry.logDate, entry]));
  const serverByDate = new Map(records.map((entry) => [entry.logDate, entry]));

  const merged: SymptomLog[] = records.map((remote) => {
    const local = localByDate.get(remote.logDate);
    return local && local.savedAt >= remote.savedAt ? local : remote;
  });
  for (const entry of logs) {
    if (!serverByDate.has(entry.logDate)) merged.push(entry);
  }
  merged.sort((a, b) => (a.logDate < b.logDate ? 1 : -1));
  useSymptomStore.setState({ logs: merged });

  const toUpload = logs.filter((entry) => {
    const remote = serverByDate.get(entry.logDate);
    return !remote || entry.savedAt > remote.savedAt;
  });
  if (toUpload.length > 0) {
    useSymptomStore.setState({ remoteStatus: 'syncing' });
    await Promise.all(toUpload.map((entry) => symptomApi.upsert(entry)));
  }
  useSymptomStore.setState({ remoteStatus: 'synced' });
}

export function migrateLegacyLocalSymptoms(): void {
  if (typeof localStorage === 'undefined') return;
  const marker = 'symptom-storage-migrated-v1';
  if (localStorage.getItem(marker)) return;

  try {
    const stored = JSON.parse(localStorage.getItem('cycle-storage') ?? 'null') as {
      state?: { history?: Array<Partial<SymptomLog> & { savedAt?: string }> };
    } | null;
    const legacyEntries = stored?.state?.history ?? [];
    const logsByDate = new Map(
      useSymptomStore.getState().logs.map((entry) => [entry.logDate, entry]),
    );

    for (const entry of legacyEntries) {
      if (!entry.id || !entry.savedAt || !entry.symptoms?.length) continue;
      const logDate = entry.savedAt.slice(0, 10);
      const existing = logsByDate.get(logDate);
      if (existing && existing.savedAt >= entry.savedAt) continue;
      logsByDate.set(logDate, {
        id: `${entry.id}-symptoms`,
        logDate,
        symptoms: entry.symptoms,
        savedAt: entry.savedAt,
      });
    }

    const logs = [...logsByDate.values()].sort((a, b) =>
      a.logDate < b.logDate ? 1 : -1,
    );
    useSymptomStore.setState({ logs });
  } catch {
    // 손상된 이전 저장값은 건너뛰고 새 증상 기록을 시작합니다.
  } finally {
    localStorage.setItem(marker, '1');
  }
}

export const useSymptomStore = create<SymptomState>()(
  persist(
    (set, get) => ({
      logDate: getTodayDateString(),
      symptoms: [],
      logs: [],
      remoteStatus: 'local',
      setLogDate: (date) => {
        set({ logDate: date, symptoms: [] });
      },
      toggleSymptom: (symptom) => {
        const { logDate, logs, symptoms } = get();
        const recordedForDate = logs
          .filter((entry) => entry.logDate === logDate)
          .flatMap((entry) => entry.symptoms);
        if (recordedForDate.includes(symptom)) return;
        set({
          symptoms: symptoms.includes(symptom)
            ? symptoms.filter((item) => item !== symptom)
            : [...symptoms, symptom],
        });
      },
      saveLog: () => {
        const { logDate, symptoms, logs } = get();
        if (symptoms.length === 0) return;
        const existing = logs.find((entry) => entry.logDate === logDate);
        const existingSymptoms = existing?.symptoms ?? [];
        const newSymptoms = symptoms.filter((s) => !existingSymptoms.includes(s));
        if (newSymptoms.length === 0) {
          set({ symptoms: [] });
          return;
        }
        const combinedSymptoms = [...existingSymptoms, ...newSymptoms];
        const entry: SymptomLog = {
          id: existing?.id ?? createId(),
          logDate,
          symptoms: combinedSymptoms,
          savedAt: new Date().toISOString(),
        };
        const others = existing
          ? logs.filter((item) => item.id !== existing.id)
          : logs;
        const updatedLogs = [entry, ...others].sort((a, b) =>
          a.logDate < b.logDate ? 1 : -1,
        );
        set({ logs: updatedLogs, symptoms: [] });
        pushToServer(entry);
      },
      removeLog: (id) => {
        set({ logs: get().logs.filter((entry) => entry.id !== id) });
        removeFromServer(id);
      },
      removeSymptomFromLog: (id, symptom) => {
        const { logs } = get();
        const target = logs.find((entry) => entry.id === id);
        if (!target) return;
        const remaining = target.symptoms.filter((item) => item !== symptom);
        if (remaining.length === 0) {
          set({ logs: logs.filter((entry) => entry.id !== id) });
          removeFromServer(id);
        } else {
          const updated: SymptomLog = {
            ...target,
            symptoms: remaining,
            savedAt: new Date().toISOString(),
          };
          const updatedLogs = logs.map((entry) =>
            entry.id === id ? updated : entry,
          );
          set({ logs: updatedLogs });
          pushToServer(updated);
        }
      },
      setRemoteStatus: (status) => set({ remoteStatus: status }),
    }),
    {
      name: 'symptom-storage',
      partialize: (state) => ({
        logDate: state.logDate,
        symptoms: state.symptoms,
        logs: state.logs,
        remoteStatus: 'local' as const,
      }),
    },
  ),
);
