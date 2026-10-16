# ---- dependencies shared by dev and build ----
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# better-sqlite3 는 SQLite 이관 스크립트 전용 devDependency 라 이미지 빌드에는 필요 없습니다.
RUN npm ci --ignore-scripts

# ---- dev stage: Nest watch mode ----
FROM deps AS dev
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
EXPOSE 3000
CMD ["node", "--watch", "-r", "ts-node/register", "src/main.ts"]

# ---- build stage ----
FROM dev AS build
RUN npm run build

# ---- production stage ----
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]