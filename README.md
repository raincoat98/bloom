# Bloom 🌸

> 나의 리듬을 부드럽게 따라가는 주기 다이어리

마지막 생리 시작일과 평균 주기만 알려주면, 다음 생리·배란·가임기를 한눈에 보여주는
가벼운 웹 앱이에요.

- **계정 없이 사용** — 데이터는 브라우저(localStorage) 안에서만 다뤄집니다.
- **로그인하면 서버 저장** — 계정을 만들면 주기 기록이 백엔드(PostgreSQL)에도 저장되어
  어느 기기에서든 이어집니다.

## 저장소 구조

```
bloom/
├── bloom/                # 프론트엔드 (React 19 · TypeScript · Vite · PWA)
├── bloom-svc/            # 백엔드 API 서비스 (NestJS · TypeScript · PostgreSQL)
├── bloom-backup/         # pg_dump 기반 백업 러너 (postgres:17-alpine)
├── compose.yaml          # db + 백엔드 + 백업 + 프론트 (dev/prod 공용, env 로 분기)
├── Makefile              # env 파일을 붙여 주는 배포 명령 (make dev-up / make prod-up)
├── .env.dev.example      # 개발 배포 변수 예시
├── .env.prod.example     # 운영 배포 변수 예시 (필수값은 비워 둠 → 미설정 시 즉시 실패)
└── test-stack.sh         # API · 영속성 · 백업/복원 · SQLite 이관 통합 검증
```

## 빠른 시작 (dev)

```bash
cp .env.dev.example .env.dev       # 또는 make env-dev
docker compose --env-file .env.dev up -d --build   # 또는 make dev-up
```

- 프론트엔드: <http://localhost:5173>
- 백엔드: <http://localhost:3000> (`GET /health` → `{"status":"ok"}`, DB 장애 시 503)
- PostgreSQL: `127.0.0.1:5432` (loopback 전용, 외부 노출 없음)

중지 / 초기화:

```bash
make dev-down              # 컨테이너 중지 (DB·백업 데이터 유지)
make dev-logs              # 로그
docker compose --env-file .env.dev down -v   # DB·백업 볼륨까지 삭제 (기록 초기화)
```

> 코드를 바꾼 뒤에는 반드시 `--build`를 붙이세요. compose는 이미지 태그가 같으면 기존
> 이미지를 재사용하므로, `up -d`만 하면 예전 코드가 그대로 돌아갑니다.

## 배포: dev / prod 분리

**compose 파일은 하나, 환경변수 파일이 둘**입니다. 이렇게 하는 이유:

- 파일을 복제해 나누면 두 벌이 서로 어긋남(drift) — 설정 하나를 한쪽에만 고치는 사고
- Coolify 같은 배포 도구는 보통 compose 파일 하나만 지정받음

핵심은 **`COMPOSE_PROJECT_NAME`** 입니다. 값이 다르면 컨테이너·볼륨·이미지 이름이 전부
갈라져서, 같은 호스트에서 dev와 prod를 동시에 돌려도 데이터가 섞이지 않습니다.

| | dev | prod |
| --- | --- | --- |
| 명령 | `make dev-up` | `make prod-up` |
| env 파일 | `.env.dev` | `.env.prod` |
| 프로젝트 | `bloom-dev` | `bloom-prod` |
| 볼륨 | `bloom-dev_bloom-db` | `bloom-prod_bloom-db` |
| 이미지 | `bloom-dev-backend` 등 | `bloom-prod-backend` 등 |
| 포트 | 5432 / 3000 / 5173 | 5432 / 3000 / 5173 (호스트가 다르면 동일해도 됨) |

### 같은 호스트에서 둘 다 돌리기

포트만 겹치지 않게 바꿔 주면 됩니다.

```bash
# prod 를 dev 와 다른 포트로
DB_PORT=5500 BACKEND_PORT=3100 FRONTEND_PORT=5273 \
VITE_API_URL=http://localhost:3100 FRONTEND_URL=http://localhost:5273 \
  docker compose --env-file .env.prod up -d --build
```

### 설정 누락은 즉시 실패합니다

`JWT_SECRET` · `POSTGRES_PASSWORD` · `VITE_API_URL` · `FRONTEND_URL` 은 compose에서
필수값(`:?`)으로 선언되어 있습니다. 비어 있으면 기동 전에 이런 식으로 멈춥니다.

```
error while interpolating services.backend.environment.JWT_SECRET:
required variable JWT_SECRET is missing a value: JWT_SECRET 을 .env.dev / .env.prod 에 설정하세요
```

개발용 기본 시크릿이나 `http://localhost:3000`이 그대로 운영에 나가는 사고를 막기 위한
의도된 동작입니다. 특히 `VITE_API_URL`은 **빌드 시점에 번들에 박히므로**, prod에서
localhost가 박히면 사용자 브라우저가 자기 pc를 호출합니다.

### Coolify

- Compose 파일: `compose.yaml` 하나만 지정
- 환경변수: `.env.prod`의 값들을 Coolify 환경변수로 넣습니다. (docker compose는 셸
  환경변수를 env 파일보다 우선하므로 그대로 적용됩니다.)
- dev용 앱과 prod용 앱을 별도로 만들고 각각의 env를 넣으면 됩니다.

### 보안 체크리스트

- [ ] prod의 `JWT_SECRET`이 dev와 **다른** 값 (같으면 dev 토큰이 prod에서 통합니다)
- [ ] prod의 `POSTGRES_PASSWORD` 교체 (`openssl rand -hex 24`)
- [ ] `VITE_API_URL`·`FRONTEND_URL`이 실제 도메인 (localhost 아님)
- [ ] 프론트/백엔드는 역프록시 뒤에 두고 `BIND_HOST=127.0.0.1` 유지
- [ ] 백업 볼륨을 오프사이트로 내보내기 (아래 "백업과 복원" 참고)

## 환경변수

루트의 `.env.dev` / `.env.prod`로 관리합니다. 예시 파일을 복사해서 쓰세요.

| 변수 | dev 예 | prod 예 | 설명 |
| --- | --- | --- | --- |
| `COMPOSE_PROJECT_NAME` | `bloom-dev` | `bloom-prod` | 컨테이너·볼륨·이미지 이름 분리 |
| `NODE_ENV` | `development` | `production` | |
| `POSTGRES_USER` / `POSTGRES_DB` | `bloom` | `bloom` | |
| `POSTGRES_PASSWORD` | 임의값 | **필수, 교체** | 비면 기동 실패 |
| `DB_PORT` | `5432` | `5432` | 호스트 loopback 노출 포트 |
| `DATABASE_URL` | (미지정) | (미지정) | 지정 시 PG* 대신 사용. 관리형 Postgres용 |
| `DATABASE_SSL` | `false` | `false` | 관리형 Postgres가 TLS 요구 시 `true` |
| `JWT_SECRET` | dev 전용 | **필수, 교체** | 비면 기동 실패 |
| `BACKEND_PORT` / `FRONTEND_PORT` | `3000` / `5173` | `3000` / `5173` | |
| `VITE_API_URL` | `http://localhost:3000` | 실제 API 도메인 | **빌드 시 번들에 포함** |
| `FRONTEND_URL` | `http://localhost:5173` | 실제 프론트 도메인 | 백엔드 CORS 허용 |
| `BIND_HOST` | `127.0.0.1` | `127.0.0.1` | `0.0.0.0`으로 바꾸지 마세요 |
| `BACKUP_INTERVAL_SECONDS` | `86400` | `86400` | 백업 주기(초) |
| `BACKUP_KEEP` | `14` | `30` | 보관 덤프 개수 |

`bloom-svc/.env`는 백엔드를 호스트에서 직접(`npm run start:dev`) 돌릴 때만 씁니다.

## 백업과 복원

`backup` 서비스가 `pg_dump`(custom format)로 논리 백업을 뜨고 `bloom-backups` 볼륨에
보관합니다. 덤프 직후 `pg_restore --list`로 목차를 읽어 **손상된 파일은 버립니다.**

이하 명령의 `--env-file`은 대상 환경에 맞게 바꾸세요.

```bash
COMPOSE="docker compose --env-file .env.prod"

$COMPOSE exec backup sh -c 'ls -lt /backups'          # 덤프 목록
$COMPOSE run --rm -e BACKUP_RUN_ONCE=1 backup         # 즉시 1회 백업
```

복원은 덤프를 새 DB에 밀어넣고 백엔드를 그 DB로 가리키면 됩니다.

```bash
$COMPOSE stop backend
$COMPOSE exec db psql -U bloom -d postgres -c 'CREATE DATABASE bloom_restore'
$COMPOSE run --rm --entrypoint pg_restore backup \
  -U bloom -h db -d bloom_restore --no-owner /backups/<덤프파일>.dump
# 확인 후 승격: .env.prod 의 DATABASE_URL 을 bloom_restore 로 바꾸고 backend 재시작
$COMPOSE up -d backend
```

> ⚠️ **`bloom-backups` 볼륨은 `down -v`로 함께 삭제되고, 호스트 디스크가 날아가면 백업도
> 사라집니다.** 실제 보존이 필요하면 `backup` 서비스의 마운트를 호스트 바인드 마운트나
> 오브젝트 스토리지로 바꾸세요.

## 로컬 개발

프레임워크 자체를 수정할 때는 DB만 compose로 띄우고 나머지는 로컬에서 돌립니다.

```bash
make dev-db                 # PostgreSQL (127.0.0.1:5432)

# 터미널 1 — 백엔드 (파일 변경 시 자동 재시작)
cd bloom-svc
cp .env.example .env        # DATABASE_URL 이 localhost 를 가리키는지 확인
npm install
npm run start:dev           # http://localhost:3000 (부팅 시 마이그레이션 자동 적용)

# 터미널 2 — 프론트엔드 (Vite dev server)
cd bloom
npm install
npm run dev                 # http://localhost:5173
```

운영 실행은 `npm run build` 후 `npm run start:prod`(= `node dist/main.js`)입니다.

스키마 변경은 `bloom-svc/src/database/db.ts`의 `migrations` 배열에 **새 버전을 append**
합니다. 기존 항목은 수정하지 마세요(이미 적용된 버전은 `schema_migrations`로 건너뜁니다).

### SQLite에서 이관

기존 SQLite(`bloom-svc/data/bloom.db`) 데이터를 옮깁니다. 여러 번 실행해도 안전합니다.

```bash
cd bloom-svc
SQLITE_PATH=data/bloom.db DATABASE_URL=postgres://bloom:bloom@localhost:5432/bloom \
  npm run migrate:from-sqlite
```

이관 후 `users.id`는 uuid, `cycles.id`는 클라이언트가 만든 문자열 그대로 유지됩니다.

### 검증

```bash
./test-stack.sh
```

검증 전용 프로젝트(`bloom-test`)와 포트를 써서 dev/prod 스택을 건드리지 않습니다.
마이그레이션, 인증/주기 API 계약(응답 형태·상태 코드), 재기동 후 영속성, 백업 보관 개수
정리, 덤프 복원, SQLite 이관까지 한 번에 확인합니다.

### 백엔드 구조

```
bloom-svc/src/
  main.ts                         # 부트스트랩 (CORS · 전역 파이프/필터 · 마이그레이션 · graceful shutdown)
  app.module.ts                   # 루트 모듈
  config.ts                       # 환경변수
  common/http-exception.filter.ts # 모든 오류를 { error } 형태로 정규화
  database/
    db.ts                         # pg Pool 팩토리(DATABASE_URL 또는 PG*) + 마이그레이션 러너
    database.module.ts            # PG_POOL 프로바이더 (종료 시 pool.end)
  auth/                           # signup · login · me, JwtModule, AuthGuard, DTO
  cycles/                         # 주기 기록 CRUD, DTO 검증
  health.controller.ts            # /health (DB 연결 확인)
```

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
오류 응답은 항상 `{ error: string }` 형태입니다.
`GET /api/cycles`의 `lastPeriodDate`는 `YYYY-MM-DD` 문자열, `savedAt`은 ISO 문자열입니다.

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
- 백엔드: Node.js 22 · NestJS 11 · node-postgres(`pg`) · JWT(`@nestjs/jwt`) · bcryptjs · class-validator
- 데이터베이스: PostgreSQL 17 (`schema_migrations` 기반 버전 관리)
- 백업: `pg_dump` custom format + `pg_restore --list` 검증 + 보관 개수 관리
- 배포: Docker Compose → Coolify (compose 파일 `compose.yaml` + 환경별 env)

## 프론트엔드 디렉터리

```
bloom/src/
  App.tsx              # Bloom 헤더 · 로고 마크 · 레이아웃 · 계정 패널
  components/
    InputForm.tsx      # 주기 입력 (STEP 1)
    ResultCard.tsx     # 예측 결과 카드들
    PhaseGuide.tsx     # 현재 시기별 케어 가이드
    CycleCalendar.tsx  # 한 달 흐름 캘린더
    DatePopover.tsx    # 날짜 입력 팝오버
    AccountPanel.tsx   # 로그인/회원가입/동기화 상태
  pages/
    MainPage.tsx       # 메인 (입력 + 결과)
    HistoryPage.tsx    # 주기 입력 이력 관리
  data/phaseGuides.ts  # 시기별 음식·영양제·파트너 팁·준비물
  store/cycleStore.ts  # Zustand 스토어 (로컬 + 서버 동기화)
  store/authStore.ts   # 인증 상태
  lib/api.ts           # API 클라이언트
  lib/token.ts         # 토큰 보관
  utils/cycle.ts       # 주기 계산 로직
```

## 면책

Bloom의 예측은 평균 주기를 바탕으로 한 안내예요. 의학적 진단을 대체하지
않으며, 컨디션이 평소와 다르다면 전문가와 상담해 주세요.