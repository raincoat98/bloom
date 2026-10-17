import { describe, expect, it } from 'vitest';
import { BASE_URL, ROUTE_METAS } from './usePageMeta';

describe('usePageMeta / ROUTE_METAS', () => {
  it('defines the correct production base URL', () => {
    expect(BASE_URL).toBe('https://bloom.cloudrainit.com');
  });

  it('defines metadata for all primary routes', () => {
    const requiredRoutes = ['/', '/symptoms', '/history', '/login', '/about'];
    for (const route of requiredRoutes) {
      expect(ROUTE_METAS).toHaveProperty(route);
      const meta = ROUTE_METAS[route];

      expect(meta.title).toBeTruthy();
      expect(meta.title).toContain('Bloom');

      expect(meta.description).toBeTruthy();
      // SERP descriptions should not be excessively long (< 160 characters)
      expect(meta.description.length).toBeLessThanOrEqual(160);

      expect(meta.canonicalPath).toBe(route);
    }
  });

  it('contains primary SEO search keywords on root route', () => {
    const rootMeta = ROUTE_METAS['/'];
    expect(rootMeta.title).toContain('생리 주기');
    expect(rootMeta.title).toContain('배란일');
    expect(rootMeta.title).toContain('가임기');
    expect(rootMeta.description).toContain('생리');
  });
});
