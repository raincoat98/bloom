#!/bin/sh
# Postgres 논리 백업(pg_dump, custom format)을 주기적으로 뜨고 보관 개수를 관리합니다.
# postgres:17-alpine 이미지에서 실행되며, 클라이언트 버전이 서버 메이저와 일치해야 하므로
# compose 의 db 서비스와 같은 태그를 사용합니다.
set -eu

BACKUP_DIR="${BACKUP_DIR:-/backups}"
KEEP="${BACKUP_KEEP:-14}"
INTERVAL="${BACKUP_INTERVAL_SECONDS:-86400}"
RUN_ONCE="${BACKUP_RUN_ONCE:-0}"

stop=0
trap 'stop=1' TERM INT

prune() {
  ls -1t "$BACKUP_DIR"/bloom-*.dump 2>/dev/null \
    | tail -n +$((KEEP + 1)) \
    | while IFS= read -r file; do
        rm -f "$file"
        echo "[backup] pruned $file"
      done
}

dump_once() {
  mkdir -p "$BACKUP_DIR"
  out="$BACKUP_DIR/bloom-$(date -u +%Y%m%dT%H%M%SZ).dump"

  if ! pg_dump --format=custom --file="$out"; then
    echo "[backup] pg_dump failed" >&2
    rm -f "$out"
    return 1
  fi

  # 덤프 목차를 읽을 수 있어야 정상 파일입니다.
  if ! pg_restore --list "$out" >/dev/null 2>&1; then
    echo "[backup] verification failed, discarding $out" >&2
    rm -f "$out"
    return 1
  fi

  echo "[backup] ok $out ($(wc -c <"$out" | tr -d ' ') bytes)"
  prune
  return 0
}

# 신호를 받으면 즉시 깨어나도록 짧게 끊어서 잡니다 (docker stop 대응).
nap() {
  remaining="$1"
  while [ "$remaining" -gt 0 ] && [ "$stop" -eq 0 ]; do
    chunk=5
    [ "$remaining" -lt 5 ] && chunk="$remaining"
    sleep "$chunk" &
    wait $! 2>/dev/null || true
    remaining=$((remaining - chunk))
  done
}

if [ "$RUN_ONCE" = "1" ]; then
  dump_once
  exit 0
fi

echo "[backup] host=${PGHOST:-?} db=${PGDATABASE:-?} -> $BACKUP_DIR every ${INTERVAL}s (keep $KEEP)"
while [ "$stop" -eq 0 ]; do
  if dump_once; then
    nap "$INTERVAL"
  else
    nap 60
  fi
done
exit 0