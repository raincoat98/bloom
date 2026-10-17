import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface RouteMeta {
  title: string;
  description: string;
  canonicalPath: string;
}

export const ROUTE_METAS: Record<string, RouteMeta> = {
  '/': {
    title: 'Bloom: 나의 주기 다이어리 | 생리 주기, 배란일, 가임기 계산기',
    description:
      '마지막 생리 시작일과 평균 주기만 입력하면 다음 생리 예정일, 배란일, 가임기 계산부터 매일의 컨디션과 증상 기록까지 한눈에 확인하세요.',
    canonicalPath: '/',
  },
  '/symptoms': {
    title: '증상 관리 | 일별 컨디션 및 생리 증상 기록 (Bloom)',
    description:
      '복통, 두통, 피로 등 오늘의 신체 및 감정 증상을 귀여운 이모지로 간편하게 기록하고 이전 기록을 확인해 보세요.',
    canonicalPath: '/symptoms',
  },
  '/history': {
    title: '이력 관리 | 나의 주기 기록 보관함 (Bloom)',
    description:
      '지금까지 저장된 생리 주기 기록을 불러오거나 관리할 수 있습니다. 로그인 시 안전하게 클라우드에 동기화됩니다.',
    canonicalPath: '/history',
  },
  '/login': {
    title: '로그인 | 계정 연동 및 데이터 동기화 (Bloom)',
    description:
      'Bloom 계정으로 로그인하고 기기가 바뀌어도 소중한 생리 주기와 증상 기록을 안전하게 이어가세요.',
    canonicalPath: '/login',
  },
  '/about': {
    title: '서비스 개요 | 나의 리듬을 부드럽게 따라가는 주기 다이어리 (Bloom)',
    description:
      'Bloom은 복잡함 없이 마지막 생리일과 주기만으로 다음 생리, 배란일, 가임기를 안내하고 매일의 컨디션 증상을 기록하는 가볍고 다정한 주기 다이어리입니다.',
    canonicalPath: '/about',
  },
};

export const BASE_URL = 'https://bloom.cloudrainit.com';

export function usePageMeta() {
  const location = useLocation();

  useEffect(() => {
    const meta = ROUTE_METAS[location.pathname] ?? ROUTE_METAS['/'];

    // Update document title
    document.title = meta.title;

    // Update meta description
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) {
      descEl.setAttribute('content', meta.description);
    }

    // Update Open Graph tags
    const ogTitleEl = document.querySelector('meta[property="og:title"]');
    if (ogTitleEl) {
      ogTitleEl.setAttribute('content', meta.title);
    }

    const ogDescEl = document.querySelector('meta[property="og:description"]');
    if (ogDescEl) {
      ogDescEl.setAttribute('content', meta.description);
    }

    const ogUrlEl = document.querySelector('meta[property="og:url"]');
    if (ogUrlEl) {
      ogUrlEl.setAttribute('content', `${BASE_URL}${meta.canonicalPath}`);
    }

    // Update Twitter tags
    const twitterTitleEl = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitleEl) {
      twitterTitleEl.setAttribute('content', meta.title);
    }

    const twitterDescEl = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescEl) {
      twitterDescEl.setAttribute('content', meta.description);
    }

    // Update canonical link
    const canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl) {
      canonicalEl.setAttribute('href', `${BASE_URL}${meta.canonicalPath}`);
    }
  }, [location.pathname]);
}
