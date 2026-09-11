# Bloom 🌸

> 나의 리듬을 부드럽게 따라가는 주기 다이어리

마지막 생리 시작일과 평균 주기만 알려주면, 다음 생리·배란·가임기를 한눈에 보여주는
가벼운 웹 앱이에요.

- **계정 없이 사용** — 데이터는 브라우저(localStorage) 안에서만 다뤄집니다.
- **로그인하면 서버 저장** — 계정을 만들면 주기 기록이 백엔드(SQLite)에도 저장되어
  어느 기기에서든 이어집니다.

## 저장소 구조

```
bloom/
├── bloom/                # 프론트엔드 (React 19 · TypeScript · Vite · PWA)
├── bloom-svc/            # 백엔드 API 서비스 (Express · SQLite)
├── compose.yaml          # 프론트+백엔드를 한 번에 실행 (Docker)
└── .env.example          # compose 환경변수 예시
```

## Docker로 한 번에 실행

```bash
docker compose up -d --build
```

- 프론트엔드: <http://localhost:5173>
- 백엔드: <http://localhost:3000> (`GET /health` → `{"status":"ok"}`)

중지 / 초기화:

```bash
docker compose down        # 컨테이너 중지 (데이터 유지)
docker compose down -v     # SQLite 볼륨까지 삭제 (기록 초기화)
```

### 환경변수

루트 `.env` 파일로 오버라이드합니다. (`cp .env.example .env`)

| 변수 | 기본값 | 설명 |
| --- | --- | --- |
| `JWT_SECRET` | 개발용 고정값 | **운영 배포 시 반드시 교체** (`openssl rand -hex 32`) |
| `VITE_API_URL` | `http://localhost:3000` | 브라우저가 API를 호출하는 주소 |
| `FRONTEND_URL` | `http://localhost:5173` | 백엔드 CORS에 허용할 프론트 주소 |

프론트엔드 환경변수는 **빌드 시점에 번들에 포함**되므로, 변경 후 다시 배포해야 합니다.

## 로컬 개발

```bash
# 터미널 1 — 프론트엔드 (Vite dev server)
cd bloom
npm install
npm run dev                # http://localhost:5173

# 터미널 2 — 백엔드 (파일 변경 시 자동 재시작)
cd bloom-svc
cp .env.example .env       # 선택
npm install
npm run dev                # http://localhost:3000
```

백엔드 로컬 데이터는 `bloom-svc/data/bloom.db` (SQLite)에 저장됩니다.

## 백엔드 API

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `POST` | `/auth/signup` | 회원가입 (`{email, password}`) → `{token, user}` |
| `POST` | `/auth/login` | 로그인 → `{token, user}` |
| `GET` | `/api/me` | 내 계정 정보 (Bearer 토큰) |
| `GET` | `/api/cycles` | 내 주기 기록 목록 |
| `PUT` | `/api/cycles/:id` | 기록 저장/갱신 (같은 시작일이면 덮어씀) |
| `DELETE` | `/api/cycles/:id` | 기록 삭제 |

보호된 API는 `Authorization: Bearer <token>` 헤더가 필요합니다.

데이터 동기화 방식: 로그인 시 로컬 기록과 서버 기록을 시작일 기준으로 병합하고,
서버에 없는 기록은 자동으로 업로드합니다. 저장/삭제는 발생 시점에 실시간 반영됩니다.

## 브랜드

- **이름** — Bloom (블룸)
- **태그라인** — 나의 리듬을 부드럽게 따라가는 주기 다이어리
- **컬러 팔레트**
  - Primary `#f4584a` (Bloom Coral) — 따뜻한 산호빛
  - Accent `#3e9663` (Soft Sage) — 가임기/안정감
  - Sand `#fdfaf5` — 부드러운 배경 톤
- **타이포** — Pretendard Variable
- **로고** — 6장의 꽃잎과 황금빛 중심을 가진 미니멀 마크

## 기술 스택

- 프론트엔드: React 19 · TypeScript · Vite · Tailwind CSS · Zustand · date-fns
- 백엔드: Node.js 22 · Express · better-sqlite3 · JWT · bcryptjs
- 배포: Docker Compose → Coolify (Base Directory: 프론트 `bloom/`, 백엔드 `bloom-svc/`)

## 프론트엔드 디렉터리

```
bloom/src/
  App.tsx              # Bloom 헤더 · 로고 마크 · 레이아웃 · 계정 패널
  components/
    InputForm.tsx      # 주기 입력 (STEP 1)
    ResultCard.tsx     # 예측 결과 카드들
    PhaseGuide.tsx     # 현재 시기별 케어 가이드
    AccountPanel.tsx   # 로그인/회원가입/동기화 상태
  data/phaseGuides.ts  # 시기별 음식·영양제·파트너 팁·준비물
  store/cycleStore.ts  # Zustand 스토어 (로컬 + 서버 동기화)
  store/authStore.ts   # 인증 상태
  utils/cycle.ts       # 주기 계산 로직
```

## 면책

Bloom의 예측은 평균 주기를 바탕으로 한 안내예요. 의학적 진단을 대체하지
않으며, 컨디션이 평소와 다르다면 전문가와 상담해 주세요.