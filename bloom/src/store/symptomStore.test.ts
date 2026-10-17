import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ApiModule from '../lib/api';
import { setAuthToken } from '../lib/token';
import { useSymptomStore } from './symptomStore';

const mockApi = vi.hoisted(() => ({
  list: vi.fn().mockResolvedValue([]),
  upsert: vi.fn().mockResolvedValue({ record: null }),
  remove: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('../lib/api');
  return {
    ...actual,
    symptomApi: mockApi,
  };
});

beforeEach(() => {
  localStorage.clear();
  setAuthToken('mock-auth-token');
  useSymptomStore.setState({
    logDate: '2026-10-16',
    symptoms: [],
    logs: [],
    remoteStatus: 'local',
  });
  vi.clearAllMocks();
});

describe('symptomStore', () => {
  it('toggles symptoms on and off for the active date', () => {
    const store = useSymptomStore.getState();
    store.toggleSymptom('headache');
    expect(useSymptomStore.getState().symptoms).toEqual(['headache']);

    useSymptomStore.getState().toggleSymptom('fatigue');
    expect(useSymptomStore.getState().symptoms).toEqual(['headache', 'fatigue']);

    useSymptomStore.getState().toggleSymptom('headache');
    expect(useSymptomStore.getState().symptoms).toEqual(['fatigue']);
  });

  it('prevents toggling symptoms that are already recorded for the same date', () => {
    useSymptomStore.setState({
      logDate: '2026-10-16',
      symptoms: [],
      logs: [
        {
          id: 'log-1',
          logDate: '2026-10-16',
          symptoms: ['backache', 'fatigue'],
          savedAt: new Date().toISOString(),
        },
      ],
    });

    const store = useSymptomStore.getState();
    store.toggleSymptom('backache');
    expect(useSymptomStore.getState().symptoms).toEqual([]);

    store.toggleSymptom('headache');
    expect(useSymptomStore.getState().symptoms).toEqual(['headache']);
  });

  it('merges new symptoms into existing log on the same date and resets selection', () => {
    useSymptomStore.setState({
      logDate: '2026-10-16',
      symptoms: ['headache'],
      logs: [
        {
          id: 'log-1',
          logDate: '2026-10-16',
          symptoms: ['backache'],
          savedAt: '2026-10-16T08:00:00.000Z',
        },
      ],
    });

    useSymptomStore.getState().saveLog();

    const state = useSymptomStore.getState();
    expect(state.symptoms).toEqual([]);
    expect(state.logs).toHaveLength(1);
    expect(state.logs[0].id).toBe('log-1');
    expect(state.logs[0].symptoms).toEqual(['backache', 'headache']);
    expect(mockApi.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'log-1',
        logDate: '2026-10-16',
        symptoms: ['backache', 'headache'],
      }),
    );
  });

  it('creates a new log when recording on a date with no existing records', () => {
    useSymptomStore.setState({
      logDate: '2026-10-15',
      symptoms: ['cramps', 'bloating'],
      logs: [],
    });

    useSymptomStore.getState().saveLog();

    const state = useSymptomStore.getState();
    expect(state.symptoms).toEqual([]);
    expect(state.logs).toHaveLength(1);
    expect(state.logs[0].logDate).toBe('2026-10-15');
    expect(state.logs[0].symptoms).toEqual(['cramps', 'bloating']);
  });

  it('resets uncommitted symptoms when date changes', () => {
    useSymptomStore.setState({
      logDate: '2026-10-16',
      symptoms: ['headache'],
    });

    useSymptomStore.getState().setLogDate('2026-10-14');

    expect(useSymptomStore.getState().logDate).toBe('2026-10-14');
    expect(useSymptomStore.getState().symptoms).toEqual([]);
  });

  it('removes an entire log and re-enables its symptoms for that date', () => {
    useSymptomStore.setState({
      logDate: '2026-10-14',
      logs: [
        {
          id: 'log-1',
          logDate: '2026-10-14',
          symptoms: ['backache'],
          savedAt: new Date().toISOString(),
        },
      ],
    });

    useSymptomStore.getState().removeLog('log-1');

    expect(useSymptomStore.getState().logs).toHaveLength(0);
    expect(mockApi.remove).toHaveBeenCalledWith('log-1');

    // backache can now be toggled again
    useSymptomStore.getState().toggleSymptom('backache');
    expect(useSymptomStore.getState().symptoms).toEqual(['backache']);
  });

  it('removes a single symptom from a log entry with multiple symptoms', () => {
    useSymptomStore.setState({
      logDate: '2026-10-14',
      logs: [
        {
          id: 'log-1',
          logDate: '2026-10-14',
          symptoms: ['backache', 'fatigue'],
          savedAt: new Date().toISOString(),
        },
      ],
    });

    useSymptomStore.getState().removeSymptomFromLog('log-1', 'backache');

    const state = useSymptomStore.getState();
    expect(state.logs).toHaveLength(1);
    expect(state.logs[0].symptoms).toEqual(['fatigue']);
    expect(mockApi.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'log-1',
        symptoms: ['fatigue'],
      }),
    );

    // backache can now be selected again
    state.toggleSymptom('backache');
    expect(useSymptomStore.getState().symptoms).toEqual(['backache']);

    // fatigue is still recorded, so it cannot be selected
    state.toggleSymptom('fatigue');
    expect(useSymptomStore.getState().symptoms).toEqual(['backache']);
  });

  it('deletes the entire log if the last symptom is removed', () => {
    useSymptomStore.setState({
      logDate: '2026-10-14',
      logs: [
        {
          id: 'log-1',
          logDate: '2026-10-14',
          symptoms: ['backache'],
          savedAt: new Date().toISOString(),
        },
      ],
    });

    useSymptomStore.getState().removeSymptomFromLog('log-1', 'backache');

    expect(useSymptomStore.getState().logs).toHaveLength(0);
    expect(mockApi.remove).toHaveBeenCalledWith('log-1');
  });
});
