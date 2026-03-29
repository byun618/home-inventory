FROM node:20-slim

RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

WORKDIR /app

# 루트 워크스페이스 파일
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# shared-types
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/shared-types/src packages/shared-types/src
COPY packages/shared-types/tsconfig.json packages/shared-types/

# web
COPY apps/web/package.json apps/web/
COPY apps/web/tsconfig.json apps/web/
COPY apps/web/next.config.ts apps/web/

RUN pnpm install --frozen-lockfile

COPY apps/web/src apps/web/src
COPY apps/web/public apps/web/public

RUN pnpm --filter @home-inventory/shared-types build \
 && pnpm --filter @home-inventory/web build

WORKDIR /app/apps/web

CMD ["pnpm", "start"]
