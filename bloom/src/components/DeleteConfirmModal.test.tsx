import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import DeleteConfirmModal from './DeleteConfirmModal';

describe('DeleteConfirmModal', () => {
  it('renders modal dialog with target date and symptoms when open', () => {
    const html = renderToString(
      createElement(DeleteConfirmModal, {
        isOpen: true,
        onClose: () => {},
        onConfirm: () => {},
        logDate: '2026-10-14',
        symptoms: ['backache', 'fatigue'],
      }),
    );

    expect(html).toContain('해당 날짜의 증상 기록을 모두 삭제할까요?');
    expect(html).toContain('2026년 10월 14일');
    expect(html).toContain('허리 통증');
    expect(html).toContain('피로');
    expect(html).toContain('삭제하기');
    expect(html).toContain('취소');
    expect(html).toContain('삭제된 기록은 다시 복구할 수 없어요');
  });

  it('renders single symptom deletion message when isSingleSymptom is true', () => {
    const html = renderToString(
      createElement(DeleteConfirmModal, {
        isOpen: true,
        onClose: () => {},
        onConfirm: () => {},
        logDate: '2026-10-14',
        symptoms: ['backache'],
        isSingleSymptom: true,
      }),
    );

    expect(html).toContain('증상 기록을 삭제할까요?');
    expect(html).toContain('허리 통증');
    expect(html).toContain('에 기록된 증상을 삭제합니다');
  });

  it('returns null when closed', () => {
    const html = renderToString(
      createElement(DeleteConfirmModal, {
        isOpen: false,
        onClose: () => {},
        onConfirm: () => {},
        logDate: '2026-10-14',
        symptoms: ['backache'],
      }),
    );

    expect(html).toBe('');
  });
});
