import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    if (typeof window === 'undefined' || !window.matchMedia) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

export function applyTheme(resolvedTheme: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#000000' : '#f43f5e');
  }
}

export interface ThemeState {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  initTheme: () => () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      resolvedTheme: resolveTheme('system'),

      setMode: (mode: ThemeMode) => {
        const resolvedTheme = resolveTheme(mode);
        set({ mode, resolvedTheme });
        applyTheme(resolvedTheme);
      },

      initTheme: () => {
        const currentMode = get().mode;
        const currentResolved = resolveTheme(currentMode);
        set({ resolvedTheme: currentResolved });
        applyTheme(currentResolved);

        if (typeof window === 'undefined' || !window.matchMedia) {
          return () => {};
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
          if (get().mode === 'system') {
            const nextResolved: ResolvedTheme = e.matches ? 'dark' : 'light';
            set({ resolvedTheme: nextResolved });
            applyTheme(nextResolved);
          }
        };

        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handleChange);
          return () => mediaQuery.removeEventListener('change', handleChange);
        } else if ('addListener' in mediaQuery) {
          const legacyQuery = mediaQuery as unknown as {
            addListener: (cb: (e: MediaQueryListEvent) => void) => void;
            removeListener: (cb: (e: MediaQueryListEvent) => void) => void;
          };
          legacyQuery.addListener(handleChange);
          return () => legacyQuery.removeListener(handleChange);
        }

        return () => {};
      },
    }),
    {
      name: 'bloom-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = resolveTheme(state.mode);
          state.resolvedTheme = resolved;
          applyTheme(resolved);
        }
      },
    },
  ),
);
