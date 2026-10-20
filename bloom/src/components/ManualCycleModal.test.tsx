import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ManualCycleModal from './ManualCycleModal';

describe('ManualCycleModal', () => {
  it('returns empty string when isOpen is false', () => {
    const html = renderToString(
      createElement(ManualCycleModal, {
        isOpen: false,
        onClose: () => {},
        onSubmit: () => {},
      }),
    );

    expect(html).toBe('');
  });

  it('renders create mode properly with defaults', () => {
    const html = renderToString(
      createElement(ManualCycleModal, {
        isOpen: true,
        onClose: () => {},
        onSubmit: () => {},
        defaultCycleLength: 28,
        defaultPeriodLength: 5,
      }),
    );

    expect(html).toContain('주기 기록 직접 추가');
    expect(html).toContain('과거 생리 시작일을 입력해 통계에 반영하세요');
    expect(html).toContain('생리 시작일 (1일차)');
    expect(html).toContain('28일');
    expect(html).toContain('5일');
    expect(html).toContain('기록 추가');
    expect(html).toContain('취소');
  });

  it('renders edit mode with initial entry information', () => {
    const html = renderToString(
      createElement(ManualCycleModal, {
        isOpen: true,
        onClose: () => {},
        onSubmit: () => {},
        initialEntry: {
          id: 'test-1',
          lastPeriodDate: '2026-09-15',
          cycleLength: 30,
          periodLength: 6,
          savedAt: '2026-09-15T10:00:00.000Z',
        },
      }),
    );

    expect(html).toContain('주기 기록 수정');
    expect(html).toContain('기존 기록의 시작일과 설정을 수정해요');
    expect(html).toContain('30일');
    expect(html).toContain('6일');
    expect(html).toContain('수정 완료');
  });

  it('displays duplicate notice when current date exists in existingDates', () => {
    const html = renderToString(
      createElement(ManualCycleModal, {
        isOpen: true,
        onClose: () => {},
        onSubmit: () => {},
        initialEntry: {
          id: 'test-1',
          lastPeriodDate: '2026-09-15',
          cycleLength: 28,
          periodLength: 5,
          savedAt: '2026-09-15T10:00:00.000Z',
        },
        existingDates: ['2026-09-15', '2026-10-12'],
      }),
    );

    // Editing same date does not show duplicate warning
    expect(html).not.toContain('날짜의 기록이 이미 있어요');
  });

  it('shows duplicate warning when a date already exists for a new entry', () => {
    const today = new Date().toISOString().slice(0, 10);
    const html = renderToString(
      createElement(ManualCycleModal, {
        isOpen: true,
        onClose: () => {},
        onSubmit: () => {},
        existingDates: [today],
      }),
    );

    expect(html).toContain('날짜의 기록이 이미 있어요');
    expect(html).toContain('기록 갱신');
  });
});
