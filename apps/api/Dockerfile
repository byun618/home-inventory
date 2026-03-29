FROM node:20-slim

RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

WORKDIR /app

# 루트 워크스페이스 파일
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# shared-types
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/shared-types/src packages/shared-types/src
COPY packages/shared-types/tsconfig.json packages/shared-types/

# api
COPY apps/api/package.json apps/api/
COPY apps/api/tsconfig.json apps/api/
COPY apps/api/nest-cli.json apps/api/

RUN pnpm install --frozen-lockfile

COPY apps/api/src apps/api/src

RUN pnpm --filter @home-inventory/shared-types build \
 && pnpm --filter @home-inventory/api build

WORKDIR /app/apps/api

CMD ["sh", "-c", "pnpm schema:update && node dist/main"]
