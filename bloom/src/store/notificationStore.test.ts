import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ApiModule from '../lib/api';

const mockApi = vi.hoisted(() => ({
  getVapidPublicKey: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  getStatus: vi.fn(),
  sendTest: vi.fn(),
}));

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('../lib/api');
  return {
    ...actual,
    pushApi: mockApi,
  };
});

import { useNotificationStore } from './notificationStore';

beforeEach(() => {
  localStorage.clear();
  useNotificationStore.setState({
    isSupported: true,
    permission: 'default',
    isSubscribed: false,
    endpoint: null,
    preferences: {
      periodBefore: true,
      fertileBefore: true,
      symptomReminder: true,
    },
    isLoading: false,
    error: null,
    successMessage: null,
    bannerDismissed: false,
  });
  vi.clearAllMocks();
});

describe('notificationStore', () => {
  it('updates preferences and persists to localStorage', async () => {
    await useNotificationStore.getState().updatePreferences({ periodBefore: false });

    expect(useNotificationStore.getState().preferences.periodBefore).toBe(false);
    expect(useNotificationStore.getState().preferences.fertileBefore).toBe(true);

    const stored = JSON.parse(localStorage.getItem('bloom-notifications') ?? '{}');
    expect(stored.state.preferences.periodBefore).toBe(false);
  });

  it('dismisses banner and persists dismissal', () => {
    expect(useNotificationStore.getState().bannerDismissed).toBe(false);

    useNotificationStore.getState().dismissBanner();

    expect(useNotificationStore.getState().bannerDismissed).toBe(true);
    const stored = JSON.parse(localStorage.getItem('bloom-notifications') ?? '{}');
    expect(stored.state.bannerDismissed).toBe(true);
  });

  it('handles disableNotifications cleanly', async () => {
    useNotificationStore.setState({
      isSubscribed: true,
      endpoint: 'https://example.com/sub/123',
    });
    mockApi.unsubscribe.mockResolvedValueOnce({ ok: true });

    const success = await useNotificationStore.getState().disableNotifications();

    expect(success).toBe(true);
    expect(useNotificationStore.getState().isSubscribed).toBe(false);
    expect(useNotificationStore.getState().endpoint).toBeNull();
    expect(mockApi.unsubscribe).toHaveBeenCalledWith('https://example.com/sub/123');
  });

  it('handles test push notification when subscribed', async () => {
    useNotificationStore.setState({
      isSubscribed: true,
      endpoint: 'https://example.com/sub/123',
    });
    mockApi.sendTest.mockResolvedValueOnce({
      ok: true,
      message: '발송 완료',
      payload: {},
    });

    const success = await useNotificationStore.getState().sendTestPush('period');

    expect(success).toBe(true);
    expect(mockApi.sendTest).toHaveBeenCalledWith({
      endpoint: 'https://example.com/sub/123',
      type: 'period',
    });
    expect(useNotificationStore.getState().successMessage).toContain('테스트 알림');
  });

  it('requires subscribing before sending test push when no local permission', async () => {
    useNotificationStore.setState({
      isSubscribed: false,
      endpoint: null,
    });

    const success = await useNotificationStore.getState().sendTestPush('period');

    expect(success).toBe(false);
    expect(useNotificationStore.getState().error).toBe('먼저 알림을 켜주세요.');
  });
});
