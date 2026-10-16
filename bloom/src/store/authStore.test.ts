import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ApiModule from '../lib/api';
import type { AuthUser } from './authStore';

const mocks = vi.hoisted(() => {
  return { me: vi.fn() };
});

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('../lib/api');
  return {
    ...actual,
    authApi: { ...actual.authApi, me: mocks.me },
  };
});

import { ApiError } from '../lib/api';
import { getAuthToken, setAuthToken } from '../lib/token';
import { useAuthStore } from './authStore';

const user: AuthUser = { id: 'user-1', email: 'person@example.com' };
const token = 'persisted-token';

beforeEach(() => {
  mocks.me.mockReset();
  localStorage.clear();
  useAuthStore.setState({
    user: null,
    token: null,
    ready: false,
    busy: false,
    error: null,
  });
  setAuthToken(null);
});

describe('auth session refresh', () => {
  it.each([
    ['network failure', 0],
    ['temporary server failure', 503],
  ])('keeps the stored session after a %s', async (_label, status) => {
    useAuthStore.setState({
      user,
      token,
      ready: false,
      busy: false,
      error: null,
    });
    mocks.me.mockRejectedValueOnce(new ApiError(status, 'temporary failure'));

    await useAuthStore.getState().refresh();

    expect(useAuthStore.getState()).toMatchObject({ user, token, ready: true });
    expect(getAuthToken()).toBe(token);
    expect(JSON.parse(localStorage.getItem('bloom-auth') ?? '{}').state).toEqual({
      user,
      token,
    });
  });

  it('clears the stored session when the server rejects the token', async () => {
    useAuthStore.setState({
      user,
      token,
      ready: false,
      busy: false,
      error: null,
    });
    mocks.me.mockRejectedValueOnce(new ApiError(401, 'expired'));

    await useAuthStore.getState().refresh();

    expect(useAuthStore.getState()).toMatchObject({ user: null, token: null, ready: true });
    expect(getAuthToken()).toBeNull();
    expect(JSON.parse(localStorage.getItem('bloom-auth') ?? '{}').state).toEqual({
      user: null,
      token: null,
    });
  });
});
