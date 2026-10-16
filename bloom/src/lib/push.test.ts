import { describe, expect, it } from 'vitest';
import {
  getNotificationPermission,
  isPushSupported,
  urlBase64ToUint8Array,
} from './push';

describe('push utility functions', () => {
  it('converts base64url string to Uint8Array', () => {
    // Valid standard base64 test string
    const sample = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvKnSTg3n8mbDotWVEjh2Z0';
    const bytes = urlBase64ToUint8Array(sample);

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(0);
  });

  it('detects notification permission', () => {
    const perm = getNotificationPermission();
    expect(['default', 'granted', 'denied', 'unsupported']).toContain(perm);
  });

  it('returns boolean for push support check', () => {
    const supported = isPushSupported();
    expect(typeof supported).toBe('boolean');
  });
});
