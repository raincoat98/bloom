#!/usr/bin/env bash
# Postgres 전환 검증: API 계약 유지 + 재기동 영속성 + 덤프/복원 + SQLite 이관
set -uo pipefail
cd "$(dirname "$0")"

COMPOSE="docker compose"
# 검증 전용 프로젝트/포트 — dev·prod 스택과 충돌하지 않게 분리한다.
export COMPOSE_PROJECT_NAME=bloom-test
export POSTGRES_USER=bloom POSTGRES_PASSWORD=bloom POSTGRES_DB=bloom
export JWT_SECRET=smoke-secret
export FRONTEND_URL=http://localhost:5173
export VITE_API_URL=http://localhost:3000
export DB_PORT=5499
export BACKEND_PORT=3998
export FRONTEND_PORT=5199
DB_URL_LOCAL="postgres://bloom:bloom@127.0.0.1:5499/bloom"
PORT=3999
LOG=$(mktemp)
PIDFILE=$(mktemp)

FAILS=0
check() { # check "설명" 기대 실제
  if [ "$2" = "$3" ]; then
    printf '  ok   %s (%s)\n' "$1" "$3"
  else
    printf '  FAIL %s expected=%s actual=%s\n' "$1" "$2" "$3"
    FAILS=$((FAILS + 1))
  fi
}

jget() { # jget '<JS expr using j>'
  node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);const v=eval(process.argv[1]);console.log(v===undefined?"undefined":v)})' "$1"
}

status() { curl -s -o /dev/null -w '%{http_code}' "$@"; }

start_backend() {
  DATABASE_URL="$DB_URL_LOCAL" PORT="$PORT" JWT_SECRET=smoke-secret \
    FRONTEND_URL=http://localhost:5173 node bloom-svc/dist/main.js >>"$LOG" 2>&1 &
  echo $! >"$PIDFILE"
  for _ in $(seq 1 60); do
    [ "$(status "http://localhost:$PORT/health")" = "200" ] && return 0
    sleep 0.25
  done
  echo "FAIL: backend not healthy"; cat "$LOG"; return 1
}

stop_backend() {
  kill "$(cat "$PIDFILE")" 2>/dev/null || true
  wait "$(cat "$PIDFILE")" 2>/dev/null || true
}

cleanup() {
  stop_backend
  $COMPOSE down -v --remove-orphans >/dev/null 2>&1 || true
  rm -f "$LOG" "$PIDFILE"
}
trap cleanup EXIT

echo "== 0. Postgres 기동 + 이미지/앱 빌드 =="
(cd bloom-svc && npm run --silent build) || { echo "FAIL: build 실패"; exit 1; }
# 이미지는 태그가 같으면 재사용되므로 명시적으로 빌드한다 (stale 이미지 방지)
$COMPOSE build backup >/dev/null || { echo "FAIL: backup 이미지 빌드 실패"; exit 1; }
$COMPOSE up -d db >/dev/null
until $COMPOSE exec -T db pg_isready -U bloom -d bloom >/dev/null 2>&1; do sleep 1; done
$COMPOSE exec -T db psql -q -U bloom -d bloom -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;' >/dev/null
echo "db ready"

echo "== 1. 마이그레이션 + 기동 =="
start_backend
check "health" "200" "$(status "http://localhost:$PORT/health")"
grep -q 'applied migration 1' "$LOG" && echo "  ok   schema migration applied" || { echo "  FAIL migration not applied"; FAILS=$((FAILS+1)); }

AUTH=(-H 'content-type: application/json')
BASE="http://localhost:$PORT"

echo "== 2. 인증 =="
SIGNUP=$(curl -s -X POST "$BASE/auth/signup" "${AUTH[@]}" -d '{"email":"Smoke@Example.com","password":"secret1"}')
check "signup 201" "201" "$(status -X POST "$BASE/auth/signup" "${AUTH[@]}" -d '{"email":"other@example.com","password":"secret1"}')"
check "email 정규화" "smoke@example.com" "$(echo "$SIGNUP" | jget 'j.user.email')"
TOKEN=$(echo "$SIGNUP" | jget 'j.token')
check "중복 가입 409" "409" "$(status -X POST "$BASE/auth/signup" "${AUTH[@]}" -d '{"email":"smoke@example.com","password":"secret1"}')"
check "잘못된 이메일 400" "400" "$(status -X POST "$BASE/auth/signup" "${AUTH[@]}" -d '{"email":"nope","password":"secret1"}')"
check "짧은 비밀번호 400" "400" "$(status -X POST "$BASE/auth/signup" "${AUTH[@]}" -d '{"email":"x@y.z","password":"123"}')"
check "틀린 비밀번호 401" "401" "$(status -X POST "$BASE/auth/login" "${AUTH[@]}" -d '{"email":"smoke@example.com","password":"wrongpw"}')"
check "로그인 200" "200" "$(status -X POST "$BASE/auth/login" "${AUTH[@]}" -d '{"email":"smoke@example.com","password":"secret1"}')"
check "토큰 없음 401" "401" "$(status "$BASE/api/cycles")"
check "깨진 토큰 401" "401" "$(status "$BASE/api/cycles" -H 'authorization: Bearer not-a-jwt')"
check "me 200" "200" "$(status "$BASE/api/me" -H "authorization: Bearer $TOKEN")"

AUTHZ=(-H "authorization: Bearer $TOKEN" -H 'content-type: application/json')

echo "== 3. 주기 기록 =="
PUT1=$(curl -s -X PUT "$BASE/api/cycles/c1" "${AUTHZ[@]}" -d '{"lastPeriodDate":"2026-09-01","cycleLength":28,"periodLength":5,"savedAt":"2026-09-01T00:00:00.000Z"}')
check "lastPeriodDate 문자열 유지" "2026-09-01" "$(echo "$PUT1" | jget 'j.record.lastPeriodDate')"
check "savedAt ISO" "2026-09-01T00:00:00.000Z" "$(echo "$PUT1" | jget 'j.record.savedAt')"
curl -s -X PUT "$BASE/api/cycles/c2" "${AUTHZ[@]}" -d '{"lastPeriodDate":"2026-08-04","cycleLength":27,"periodLength":4,"savedAt":"2026-08-04T00:00:00.000Z"}' >/dev/null
check "2건 조회" "2" "$(curl -s "$BASE/api/cycles" "${AUTHZ[@]}" | jget 'j.records.length')"
check "정렬(최신 savedAt 먼저)" "2026-09-01" "$(curl -s "$BASE/api/cycles" "${AUTHZ[@]}" | jget 'j.records[0].lastPeriodDate')"
# 같은 시작일 재저장 → 덮어쓰기
curl -s -X PUT "$BASE/api/cycles/c3" "${AUTHZ[@]}" -d '{"lastPeriodDate":"2026-09-01","cycleLength":30,"periodLength":6,"savedAt":"2026-09-02T00:00:00.000Z"}' >/dev/null
LIST=$(curl -s "$BASE/api/cycles" "${AUTHZ[@]}")
check "같은 시작일 덮어씀(개수 유지)" "2" "$(echo "$LIST" | jget 'j.records.length')"
check "덮어쓴 값 반영" "30" "$(echo "$LIST" | jget 'j.records[0].cycleLength')"
check "잘못된 날짜 400" "400" "$(status -X PUT "$BASE/api/cycles/c9" "${AUTHZ[@]}" -d '{"lastPeriodDate":"2026/09/01","cycleLength":28,"periodLength":5}')"
check "주기 범위 400" "400" "$(status -X PUT "$BASE/api/cycles/c9" "${AUTHZ[@]}" -d '{"lastPeriodDate":"2026-09-01","cycleLength":0,"periodLength":5}')"
check "삭제 204" "204" "$(status -X DELETE "$BASE/api/cycles/c2" "${AUTHZ[@]}")"
check "재삭제 404" "404" "$(status -X DELETE "$BASE/api/cycles/c2" "${AUTHZ[@]}")"
check "삭제 후 1건" "1" "$(curl -s "$BASE/api/cycles" "${AUTHZ[@]}" | jget 'j.records.length')"

echo "== 4. 재기동 후 영속성 =="
stop_backend
start_backend
check "재기동 후 1건 유지" "1" "$(curl -s "$BASE/api/cycles" -H "authorization: Bearer $TOKEN" | jget 'j.records.length')"
check "토큰 재사용 가능" "200" "$(status "$BASE/api/me" -H "authorization: Bearer $TOKEN")"

echo "== 5. 백업 =="
$COMPOSE run --rm --no-deps -T -e BACKUP_RUN_ONCE=1 backup >/dev/null 2>&1
$COMPOSE run --rm --no-deps -T -e BACKUP_RUN_ONCE=1 -e BACKUP_KEEP=1 backup >/dev/null 2>&1
sleep 1
$COMPOSE run --rm --no-deps -T -e BACKUP_RUN_ONCE=1 -e BACKUP_KEEP=1 backup >/dev/null 2>&1
DUMPS=$($COMPOSE run --rm --no-deps -T --entrypoint sh backup -c 'ls -1 /backups | wc -l' | tr -d '[:space:]')
check "보관 개수 1로 정리" "1" "$DUMPS"
DUMP=$($COMPOSE run --rm --no-deps -T --entrypoint sh backup -c 'ls -1t /backups/bloom-*.dump | head -1' | tr -d '[:space:]')
echo "  덤프: $DUMP"

echo "== 6. 복원 =="
$COMPOSE exec -T db psql -q -U bloom -d postgres -c 'DROP DATABASE IF EXISTS bloom_restore' >/dev/null
$COMPOSE exec -T db psql -q -U bloom -d postgres -c 'CREATE DATABASE bloom_restore' >/dev/null
$COMPOSE run --rm --no-deps -T --entrypoint pg_restore backup -U bloom -h db -d bloom_restore --no-owner "$DUMP" >/dev/null 2>&1
LIVE=$($COMPOSE exec -T db psql -tA -U bloom -d bloom -c "SELECT (SELECT COUNT(*) FROM users)::text || '/' || (SELECT COUNT(*) FROM cycles)::text")
RESTORED=$($COMPOSE exec -T db psql -tA -U bloom -d bloom_restore -c "SELECT (SELECT COUNT(*) FROM users)::text || '/' || (SELECT COUNT(*) FROM cycles)::text")
check "원본 데이터 (users/cycles)" "2/1" "$LIVE"
check "복원 데이터가 원본과 일치" "$LIVE" "$RESTORED"

echo "== 7. SQLite → Postgres 이관 =="
$COMPOSE exec -T db psql -q -U bloom -d postgres -c 'DROP DATABASE IF EXISTS bloom_migrate' >/dev/null
$COMPOSE exec -T db psql -q -U bloom -d postgres -c 'CREATE DATABASE bloom_migrate' >/dev/null
LEGACY=$(mktemp -d)
node -e '
const Database = require("./bloom-svc/node_modules/better-sqlite3");
const db = new Database(process.argv[1]);
db.exec(`
  CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);
  CREATE TABLE cycles (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, last_period_date TEXT NOT NULL, cycle_length INTEGER NOT NULL, period_length INTEGER NOT NULL, saved_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE (user_id, last_period_date));
`);
const now = new Date().toISOString();
db.prepare("INSERT INTO users VALUES (?,?,?,?)").run("11111111-1111-4111-8111-111111111111","legacy@example.com","hash",now);
db.prepare("INSERT INTO cycles VALUES (?,?,?,?,?,?,?)").run("old-c1","11111111-1111-4111-8111-111111111111","2026-05-01",29,5,now,now);
db.close();
console.log("legacy sqlite seeded");
' "$LEGACY/bloom.db"
(cd bloom-svc && SQLITE_PATH="$LEGACY/bloom.db" DATABASE_URL="postgres://bloom:bloom@127.0.0.1:5499/bloom_migrate" npm run --silent migrate:from-sqlite) | tail -1
MIGRATED=$($COMPOSE exec -T db psql -tA -U bloom -d bloom_migrate -c "SELECT (SELECT COUNT(*) FROM users)::text || '/' || (SELECT COUNT(*) FROM cycles)::text || '/' || (SELECT cycle_length FROM cycles)::text")
check "이관 결과 (users/cycles/length)" "1/1/29" "$MIGRATED"
rm -rf "$LEGACY"

echo
if [ "$FAILS" -eq 0 ]; then echo "TEST PASS"; else echo "TEST FAIL ($FAILS)"; exit 1; fi