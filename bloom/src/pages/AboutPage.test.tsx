import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AboutPage from './AboutPage';

describe('AboutPage', () => {
  it('renders hero title and core introductory message', () => {
    const html = renderToString(
      createElement(
        MemoryRouter,
        null,
        createElement(AboutPage),
      ),
    );

    expect(html).toContain('Bloom 서비스 소개');
    expect(html).toContain('나의 리듬을 부드럽게 따라가는');
    expect(html).toContain('가볍고 다정한 주기 다이어리');
    expect(html).toContain('어지러운 광고와 복잡한 가입 절차 없이');
  });

  it('renders primary CTA buttons navigating to features', () => {
    const html = renderToString(
      createElement(
        MemoryRouter,
        null,
        createElement(AboutPage),
      ),
    );

    expect(html).toContain('오늘의 리듬 확인하기');
    expect(html).toContain('증상 기록해보기');
  });

  it('renders all four core features', () => {
    const html = renderToString(
      createElement(
        MemoryRouter,
        null,
        createElement(AboutPage),
      ),
    );

    expect(html).toContain('스마트 주기 예측 &amp; 한눈 캘린더');
    expect(html).toContain('이모지로 3초 만에 남기는 증상 기록');
    expect(html).toContain('시기별 맞춤 영양 &amp; 케어 가이드');
    expect(html).toContain('놓치지 않는 스마트 웹 푸시 알림');
  });

  it('renders Bloom three commitments', () => {
    const html = renderToString(
      createElement(
        MemoryRouter,
        null,
        createElement(AboutPage),
      ),
    );

    expect(html).toContain('Bloom이 지키는 3가지 약속');
    expect(html).toContain('가입 없는 즉시 사용');
    expect(html).toContain('안전한 클라우드 동기화');
    expect(html).toContain('철저한 데이터 보호');
  });

  it('renders FAQ section and medical disclaimer', () => {
    const html = renderToString(
      createElement(
        MemoryRouter,
        null,
        createElement(AboutPage),
      ),
    );

    expect(html).toContain('자주 묻는 질문');
    expect(html).toContain('회원가입 없이도 모든 기능을 이용할 수 있나요?');
    expect(html).toContain('비회원으로 기록하다가 나중에 로그인하면 이전 기록이 유지되나요?');
    expect(html).toContain('웹 푸시 알림은 어떻게 설정하나요?');
    expect(html).toContain('주기가 불규칙한 편인데 도움이 될까요?');
    expect(html).toContain('Bloom의 예측 결과를 피임 목적으로 사용할 수 있나요?');
    expect(html).toContain('면책 안내:');
  });
});
