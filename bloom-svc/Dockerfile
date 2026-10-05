# ---- build stage: TypeScript 컴파일 (dev 의존성 필요) ----
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
# better-sqlite3 는 SQLite 이관 스크립트 전용 devDependency 라 이미지 빌드에는 필요 없습니다.
# (기본값으로 두면 node-gyp 빌드를 시도해 C 툴체인 없는 이미지에서 실패합니다.)
RUN npm ci --ignore-scripts
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---- runtime stage: 컴파일 산출물 + 프로덕션 의존성만 ----
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]