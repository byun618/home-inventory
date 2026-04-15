# Operations — home-inventory

미래의 변상현(또는 협업자)이 이 레포를 다시 띄우거나 디버깅할 때 알아야 할 **비명시적 운영 지식** 모음. 코드만 봐서는 알 수 없는 gotcha, 버전 핀 이유, 디버깅 에피소드 중심.

설계 의도/기능 명세는 `~/brain/projects/home-inventory/` 와 루트 `CLAUDE.md` 참고.

---

## 1. 패키지 매니저 / 모노레포

### pnpm 전용 — npm 절대 사용 금지
- 루트 `package.json` 의 `packageManager: "pnpm@10.8.1"` 로 버전 고정.
- Dockerfile 에서도 `corepack prepare pnpm@10.8.1 --activate` 로 동일 버전 강제.
- 출처: 루트 `package.json`, `Dockerfile`, 메모리 `feedback_pnpm.md`.

### MikroORM 은 v6.x 고정 (v7 금지)
- `apps/api/package.json` 에 모든 `@mikro-orm/*` 를 `^6` 으로 명시.
- v7 은 breaking change 가 있어 이 코드베이스와 호환되지 않음.
- 출처: 메모리 `feedback_mikroorm_v7_breaking.md`, `apps/api/package.json`.

### pnpm lifecycle 스크립트 허용 리스트
- `pnpm.onlyBuiltDependencies`: `@nestjs/core`, `bcrypt`, `sharp`.
- pnpm 10+ 는 기본적으로 postinstall 스크립트를 차단하므로, 네이티브 빌드가 필요한 이 세 패키지를 허용 리스트에 넣어둬야 설치가 깨지지 않음.
- 출처: 루트 `package.json`.

### `pnpm deploy` 스크립트명 금지
- 과거에 `pnpm deploy` 를 배포 스크립트로 썼다가 pnpm 내장 `deploy` 명령과 충돌해서 실패.
- 현재는 `pnpm docker:deploy` 로 리네임. 새 스크립트를 만들 때 pnpm 내장과 겹치지 않는지 확인 필요.
- 출처: 커밋 `203e556 fix: deploy → docker:deploy 스크립트명 변경 (pnpm 내장 명령어 충돌)`.

---

## 2. 환경변수 / 설정

### 루트 `.env` 하나로 통합
- 로컬 개발/CLI/Docker 모두 루트 `.env` 를 읽도록 일원화. 앱별 `.env` 없음.
- 출처: 커밋 `5cba186 chore: 환경변수 루트 .env로 통합 + 스크립트 정리`, 루트 `CLAUDE.md`.

### `mikro-orm.config.ts` 에서 dotenv 수동 로드
- MikroORM CLI (`schema:create`, `schema:update` 등) 는 NestJS 부트스트랩을 거치지 않으므로 `.env` 가 자동 로드되지 않음.
- `apps/api/src/mikro-orm.config.ts` 상단에서 명시적으로 `config({ path: resolve(__dirname, '../../../.env') })` 호출.
- 이걸 빼면 CLI 에서 DB 연결 정보를 못 읽어서 schema 명령이 실패함.
- 출처: 커밋 `7667db2 fix: mikro-orm.config에서 dotenv 로드 — CLI에서도 .env 읽도록`, `apps/api/src/mikro-orm.config.ts`.

### 필수 환경변수 (`.env.example`)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_REFRESH_SECRET`.
- `DB_USER` 는 의도적으로 기본값 비워둠 — 실수로 root 접속하는 것 방지.
- 출처: `.env.example`, 커밋 `f31675d chore: .env.example DB_USER 기본값 제거`.

---

## 3. Docker / 배포

### 공용 Dockerfile + turbo prune
- 루트에 Dockerfile 하나, `ARG APP` 으로 api/web 분기. `turbo prune @home-inventory/${APP} --docker` 로 대상 앱 의존성만 추출 후 빌드.
- 멀티스테이지: `base → pruner → installer → builder → runner`. installer 단계는 lockfile + package.json 만 복사해서 캐시를 극대화.
- runner 실행 시 api 면 `schema:update` 후 `node dist/main`, web 이면 `pnpm start`.
- 출처: `Dockerfile`, 커밋 `537c576 refactor: 공용 Dockerfile + turbo prune`.

### DB 는 외부 MySQL 에 의존 — 컨테이너 안에 DB 없음
- `docker-compose.yml` 에 MySQL 서비스가 **없다**. API 컨테이너가 `host.docker.internal:3306` 으로 호스트 MySQL 에 붙음.
- `extra_hosts: ["host.docker.internal:host-gateway"]` 로 Linux/맥미니 호환 해결.
- 맥미니는 `homelab-infra` 레포의 공유 MySQL 을 쓰기 때문에 home-inventory 자체 MySQL 서비스를 제거함.
- 즉, **이 레포만 클론해서 Docker 로 띄우면 DB 가 없어서 실패**. 별도로 MySQL 을 띄우고 `DB_NAME` 데이터베이스를 만들어놔야 함.
- 출처: `docker-compose.yml`, 커밋 `b3a8d7b docker-compose에서 자체 MySQL 제거, homelab-infra 공유 MySQL 사용`.

### DB 볼륨은 `~/.db/home-inventory/mysql` 바인드 마운트
- named volume 이 아닌 `~/.db/{서비스명}/` 하위 바인드 마운트로 관리. 맥북/맥미니 모두 동일 규칙 (homelab-infra 공유 MySQL 도 같은 규칙).
- 출처: 커밋 `db29e73 chore: DB 볼륨을 ~/.db/home-inventory/mysql 바인드 마운트로 변경`, 메모리 `feedback_db_path.md`.

### (과거) MySQL healthcheck — API start 순서 보장
- 자체 MySQL 시절, API 가 DB 준비 전에 붙어서 크래시 하던 이슈가 있었음. healthcheck + `depends_on.condition: service_healthy` 로 해결.
- 현재는 외부 MySQL 이라 해당 없지만, 자체 MySQL 을 다시 도입할 때 참고.
- 출처: 커밋 `6823318 fix: MySQL healthcheck 추가 — API가 DB 준비 후 시작`.

### `pnpm docker:deploy` = git pull + rebuild
- 맥미니에서 배포 절차: `cd home-inventory && pnpm docker:deploy`.
- 내부적으로 `git pull && docker-compose up -d --build` 실행.
- 출처: 루트 `package.json`.

### API 컨테이너 기동 시 `schema:update` 자동 실행
- Dockerfile runner CMD: api 일 때 `pnpm schema:update && node dist/main`.
- 스키마 변경이 있는 배포는 자동 반영되지만, **파괴적 변경 (컬럼 drop 등) 은 데이터 유실 위험**이 있으니 사전에 수동 검토 필요.
- 출처: `Dockerfile`.

### `.dockerignore` 에 `.env` 포함
- `.env` 가 이미지에 실수로 구워지지 않도록 제외. 환경변수는 `docker-compose.yml` 의 `environment` 블록으로만 주입.
- 출처: `.dockerignore`, `docker-compose.yml`.

---

## 4. 네트워크 / 프록시

### Next.js `rewrites` 쓰지 말 것 — Route Handler 프록시 사용
- 초기 구현은 `next.config.ts` 의 `rewrites` 로 `/api/*` 를 NestJS 로 프록시했으나, Docker 빌드 시점에 대상 URL 이 **빌드 타임에 고정**되어 컨테이너 네트워크 (`http://api:3001`) 로 제대로 연결되지 않음.
- 해결: `apps/web/src/app/api/[...path]/route.ts` 에서 `process.env.API_INTERNAL_URL` 을 런타임에 읽는 Route Handler 로 프록시.
- 출처: 커밋 `1ef6d48 fix: rewrites → API Route Handler 프록시로 변경`, `apps/web/src/app/api/[...path]/route.ts`, 루트 `CLAUDE.md`.

### `API_INTERNAL_URL` 은 build arg 로도 전달
- Web Docker 빌드 시 Next.js 가 환경변수를 스냅샷하는 경우가 있어, docker-compose `environment` 뿐 아니라 build arg 로도 전달해야 안정적으로 동작함.
- 출처: 커밋 `ff37d71 fix: Web Docker 빌드 시 API_INTERNAL_URL을 build arg로 전달`.

### 외부 노출은 port 3000 하나 (ngrok)
- 맥미니에서 Next.js 의 3000 포트만 ngrok 으로 노출. 모든 API/WebSocket 트래픽은 Route Handler 프록시를 경유해서 내부 `api:3001` 로 전달.
- 이 덕분에 CORS 이슈 없고 ngrok 터널이 하나면 됨.
- 출처: 루트 `CLAUDE.md`, 초기 설계 세션.

---

## 5. 인증 / 라우팅 에피소드

### 만료 토큰으로 비인증 API 호출 시 로그인 페이지 강제 이동 제거
- 초기 구현에서 만료 토큰이 감지되면 무조건 `/login` 으로 리다이렉트했는데, 초대 링크 등 비인증 라우트에서 엉뚱하게 로그인 페이지로 튕기는 버그가 있었음. 해당 강제 이동을 제거.
- 출처: 커밋 `89a9b33 fix: 만료 토큰으로 비인증 API 호출 시 로그인 페이지 강제 이동 제거`.

### Household 중복 생성 방지
- 회원가입 시 Household 를 만들지 않고, **홈 진입 시 없으면 생성** 으로 바꿈. 초대 가입 흐름과 일반 가입 흐름이 동시에 Household 를 만들어서 중복이 발생하던 문제 해결.
- 출처: 커밋 `8b265fa fix: Household 중복 생성 방지`, 루트 `CLAUDE.md`.

### 초대 → 회원가입 → 수락 흐름 버그
- 초대 링크를 타고 온 비로그인 사용자가 회원가입 후 초대를 수락하는 경로에서 여러 번 fix 가 필요했음. 이 흐름을 수정할 때는 초대 토큰 유지 + Household 중복 생성 방지 두 가지를 함께 고려해야 함.
- 출처: 커밋 `ec6ba41 fix: 초대 → 회원가입 → 수락 흐름 수정`, `4771212 fix: 초대 수락 흐름 수정`.

---

## 6. 실시간 / WebSocket

### 클라이언트에서 자기 이벤트 무시 (senderId 비교)
- REST 요청 → `EventService` → WebSocket Gateway broadcast 구조. 브로드캐스트는 전체 대상이라 요청한 본인도 다시 받음. 이를 그대로 처리하면 로컬 optimistic update 와 충돌하므로, 클라이언트에서 `senderId` 를 비교해 자기 이벤트는 무시.
- 출처: 루트 `CLAUDE.md`.

---

## 7. 참고 포트/경로 요약

| 항목 | 값 |
|---|---|
| Web (Next.js) | `:3000` |
| API (NestJS) | `:3001` |
| DB | 호스트 `:3306` (컨테이너에서 `host.docker.internal`) |
| DB 데이터 경로 | `~/.db/home-inventory/mysql` (homelab-infra 공유 규칙) |
| DB 이름 기본값 | `home_inventory` |
| 배포 타겟 | 맥미니 + docker-compose + ngrok |
| 외부 노출 | Next.js `:3000` 만 ngrok |
