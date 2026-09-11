// 인증 토큰을 모듈 전역에 보관하는 얇은 계층.
// api.ts 와 authStore.ts 가 서로를 import 하지 않도록 끊어주는 역할.
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}