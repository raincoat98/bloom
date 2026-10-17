import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import SettingsPage from './SettingsPage';

describe('SettingsPage', () => {
  it('renders dark mode settings section and all three options', () => {
    const html = renderToString(
      createElement(
        MemoryRouter,
        null,
        createElement(SettingsPage),
      ),
    );

    expect(html).toContain('화면 모드');
    expect(html).toContain('기기 환경에 맞추거나 눈이 편안한 테마를 직접 선택해 보세요');
    expect(html).toContain('시스템 설정');
    expect(html).toContain('라이트 모드');
    expect(html).toContain('다크 모드');
    expect(html).toContain('기기 테마에 맞춰 자동 변경');
    expect(html).toContain('화사하고 밝은 화면');
    expect(html).toContain('눈이 편안한 어두운 화면');
  });

  it('renders system mode badge by default', () => {
    const html = renderToString(
      createElement(
        MemoryRouter,
        null,
        createElement(SettingsPage),
      ),
    );

    expect(html).toContain('시스템 설정 (');
  });

  it('renders app information section', () => {
    const html = renderToString(
      createElement(
        MemoryRouter,
        null,
        createElement(SettingsPage),
      ),
    );

    expect(html).toContain('Bloom 주기 다이어리');
    expect(html).toContain('나의 리듬을 부드럽게 따라가는 주기 다이어리 웹 앱입니다.');
  });
});
