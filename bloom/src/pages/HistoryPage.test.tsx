import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as CycleStoreModule from '../store/cycleStore';
import type { CycleHistoryEntry } from '../store/cycleStore';
import HistoryPage from './HistoryPage';

let mockHistory: CycleHistoryEntry[] = [];
let mockCycleLength = 28;

vi.mock('../store/cycleStore', async () => {
  const actual = await vi.importActual<typeof CycleStoreModule>('../store/cycleStore');

  const useMockCycleStore = (selector: (state: unknown) => unknown) => {
    const mockState = {
      history: mockHistory,
      cycleLength: mockCycleLength,
      periodLength: 5,
      lastPeriodDate: mockHistory[0]?.lastPeriodDate ?? '2026-10-19',
      setCycleLength: (days: number) => {
        mockCycleLength = days;
      },
      loadFromHistory: vi.fn(),
      removeFromHistory: vi.fn(),
      reset: vi.fn(),
      addToHistory: vi.fn(),
      setLastPeriodDate: vi.fn(),
      setPeriodLength: vi.fn(),
      setRemoteStatus: vi.fn(),
      remoteStatus: 'local' as const,
    };
    return selector(mockState);
  };

  return {
    ...actual,
    useCycleStore: useMockCycleStore,
  };
});

describe('HistoryPage with cycle statistics', () => {
  beforeEach(() => {
    mockHistory = [];
    mockCycleLength = 28;
  });

  it('renders empty history view when no entries exist', () => {
    const html = renderToString(
      createElement(
        MemoryRouter,
        null,
        createElement(HistoryPage),
      ),
    );

    expect(html).toContain('아직 저장된 기록이 없어요');
    expect(html).toContain('저장된 주기 기록');
  });

  it('renders guide note when only 1 record exists', () => {
    mockHistory = [
      {
        id: 'single',
        lastPeriodDate: '2026-10-01',
        cycleLength: 28,
        periodLength: 5,
        savedAt: '2026-10-01T00:00:00.000Z',
      },
    ];

    const html = renderToString(
      createElement(
        MemoryRouter,
        null,
        createElement(HistoryPage),
      ),
    );

    expect(html).toContain('주기 통계 분석 안내');
    expect(html).toContain('생리 시작일을 1건 더 추가하시면 실제 기록 간격과 이전 주기, 평균 주기를 자동으로 계산해 드려요');
    expect(html).toContain('첫 기준 기록');
  });

  it('renders rich cycle statistics (average, previous, intervals) when 2+ records exist', () => {
    mockHistory = [
      {
        id: 'recent',
        lastPeriodDate: '2026-10-01',
        cycleLength: 28,
        periodLength: 5,
        savedAt: '2026-10-01T00:00:00.000Z',
      },
      {
        id: 'prev',
        lastPeriodDate: '2026-09-03', // 28일 간격
        cycleLength: 28,
        periodLength: 5,
        savedAt: '2026-09-03T00:00:00.000Z',
      },
    ];

    const html = renderToString(
      createElement(
        MemoryRouter,
        null,
        createElement(HistoryPage),
      ),
    );

    // 통계 분석 섹션
    expect(html).toContain('나의 주기 통계 분석');
    expect(html).toContain('평균 주기');
    expect(html).toContain('이전 주기');
    expect(html).toContain('주기 변동');
    expect(html).toContain('직전 기록 간격');
    expect(html).toContain('회 간격 분석');

    // 기록 목록의 간격 배지
    expect(html).toContain('이전 주기와');
    expect(html).toContain('28');
    expect(html).toContain('첫 기준 기록');
  });
});
