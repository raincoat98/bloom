import { getAuthToken } from './token';

export const API_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
).replace(/\/+$/, '');

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, '서버에 연결할 수 없어요.');
  }

  if (res.status === 204) return undefined as T;

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // 응답 본문이 없을 수 있음
  }

  if (!res.ok) {
    const message =
      (data as { error?: string } | null)?.error ?? `요청에 실패했어요 (${res.status})`;
    throw new ApiError(res.status, message);
  }
  return data as T;
}

export interface AuthUserPayload {
  id: string;
  email: string;
  createdAt?: string;
}

export interface AuthResult {
  token: string;
  user: AuthUserPayload;
}

export interface CycleEntry {
  id: string;
  lastPeriodDate: string;
  cycleLength: number;
  periodLength: number;
  savedAt: string;
}

export const authApi = {
  async signup(email: string, password: string) {
    return request<AuthResult>('/auth/signup', { method: 'POST', body: { email, password } });
  },
  async login(email: string, password: string) {
    return request<AuthResult>('/auth/login', { method: 'POST', body: { email, password } });
  },
  async me() {
    return request<{ user: AuthUserPayload }>('/api/me');
  },
};

export const cycleApi = {
  async list() {
    const data = await request<{ records: CycleEntry[] }>('/api/cycles');
    return data.records;
  },
  async upsert(entry: CycleEntry) {
    return request<{ record: CycleEntry }>(`/api/cycles/${encodeURIComponent(entry.id)}`, {
      method: 'PUT',
      body: entry,
    });
  },
  async remove(id: string) {
    await request<void>(`/api/cycles/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};