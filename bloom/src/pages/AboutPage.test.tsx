import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AboutPage from './AboutPage';

describe('AboutPage', () => {
  it('renders hero title and core accessible message', () => {
    const html = renderToString(
      createElement(
        MemoryRouter,
        null,
        createElement(AboutPage),
      ),
    );

    expect(html).toContain('Bloom 서비스 소개');
    expect(html).toContain('설치도, 가입도 필요 없이');
    expect(html).toContain('언제 어디서나 가볍게 여는 주기 다이어리');
    expect(html).toContain('웹 브라우저에서 바로 열고 날짜만 콕 찍으면');
  });

  it('renders quick access badges', () => {
    const html = renderToString(
      createElement(
        MemoryRouter,
        null,
        createElement(AboutPage),
      ),
    );

    expect(html).toContain('앱 설치 없이 바로 열기');
    expect(html).toContain('가입 절차 없이 3초 시작');
    expect(html).toContain('이모지로 3초 기록');
    expect(html).toContain('스마트폰·PC 어디서나');
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

  it('renders all four core features in user-friendly terms', () => {
    const html = renderToString(
      createElement(
        MemoryRouter,
        null,
        createElement(AboutPage),
      ),
    );

    expect(html).toContain('날짜만 콕 찍으면 끝나는 주기 예측 &amp; 캘린더');
    expect(html).toContain('글 쓸 필요 없이 터치 한 번, 이모지 기록');
    expect(html).toContain('내 몸의 시기에 맞춘 다정한 케어 가이드');
    expect(html).toContain('중요한 날을 미리 챙겨주는 조용한 알림');
  });

  it('renders ease-of-use reasons', () => {
    const html = renderToString(
      createElement(
        MemoryRouter,
        null,
        createElement(AboutPage),
      ),
    );

    expect(html).toContain('Bloom을 마음 편히 쓸 수 있는 이유');
    expect(html).toContain('앱 설치 없는 간편함');
    expect(html).toContain('첫 화면부터 즉시 사용');
    expect(html).toContain('설명서 없이 바로 쓰는 사용법');
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
    expect(html).toContain('정말 회원가입 없이 그냥 써도 되나요?');
    expect(html).toContain('앱스토어에서 앱을 따로 다운로드받아야 하나요?');
    expect(html).toContain('생리 주기가 매달 달라지는데 잘 맞을까요?');
    expect(html).toContain('다가오는 일정을 잊지 않도록 알림을 받을 수 있나요?');
    expect(html).toContain('배란일이나 가임기 예측을 피임에 그대로 믿어도 되나요?');
    expect(html).toContain('면책 안내:');
  });
});
