# dev / prod 배포 편의 명령.
#   make dev-up   → docker compose --env-file .env.dev  up -d --build
#   make prod-up  → docker compose --env-file .env.prod up -d --build
#
# env 파일이 없으면 example 을 복사해 만듭니다. 값을 확인한 뒤 기동하세요.

COMPOSE := docker compose
DEV := $(COMPOSE) --env-file .env.dev
PROD := $(COMPOSE) --env-file .env.prod

.PHONY: env-dev env-prod dev-up dev-down dev-logs dev-db prod-up prod-down prod-logs prod-ps

env-dev:
	@test -f .env.dev || { cp .env.dev.example .env.dev; echo "created .env.dev"; }

env-prod:
	@test -f .env.prod || { cp .env.prod.example .env.prod; echo "created .env.prod — 비어 있는 필수값(POSTGRES_PASSWORD, JWT_SECRET, VITE_API_URL, FRONTEND_URL)을 채우세요"; }

dev-up: env-dev
	$(DEV) up -d --build

dev-down:
	$(DEV) down

dev-logs:
	$(DEV) logs -f --tail=100

# 로컬 개발용: DB만 띄웁니다 (프론트/백엔드는 npm run dev / npm run start:dev).
dev-db: env-dev
	$(DEV) up -d db

prod-up: env-prod
	$(PROD) up -d --build

prod-down:
	$(PROD) down

prod-logs:
	$(PROD) logs -f --tail=100

prod-ps:
	$(PROD) ps