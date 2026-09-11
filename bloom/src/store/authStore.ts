import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../lib/api';
import { setAuthToken } from '../lib/token';

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  /** 부팅 시 저장된 토큰 검증이 끝났는지 여부 */
  ready: boolean;
  busy: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  /** 저장된 토큰으로 계정 상태를 복원 (앱 시작 시 1회) */
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      ready: false,
      busy: false,
      error: null,

      async login(email, password) {
        set({ busy: true, error: null });
        try {
          const result = await authApi.login(email, password);
          setAuthToken(result.token);
          set({ token: result.token, user: result.user });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '로그인에 실패했어요.' });
          throw error;
        } finally {
          set({ busy: false });
        }
      },

      async signup(email, password) {
        set({ busy: true, error: null });
        try {
          const result = await authApi.signup(email, password);
          setAuthToken(result.token);
          set({ token: result.token, user: result.user });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '회원가입에 실패했어요.' });
          throw error;
        } finally {
          set({ busy: false });
        }
      },

      logout() {
        setAuthToken(null);
        set({ user: null, token: null, error: null });
      },

      async refresh() {
        const { token, user } = get();
        if (!token || !user) {
          setAuthToken(null);
          set({ ready: true });
          return;
        }
        setAuthToken(token);
        try {
          const result = await authApi.me();
          set({ user: result.user, token, ready: true });
        } catch {
          setAuthToken(null);
          set({ user: null, token: null, ready: true });
        }
      },
    }),
    {
      name: 'bloom-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);