# 우리집 — Home Inventory

> 우리집 물건을 같이 아는 상태를 만드는 앱 — "물어보지 않아도 되는 집"

## 서비스 개요

- 타겟: 나 + 와이프, 2인 MVP
- 집 안 물건 목록을 공유하고 실시간 동기화
- 설계/디자인 문서: `~/brain/projects/home-inventory/`

## 기술 스택

| 영역 | 스택 |
|---|---|
| 모노레포 | Turborepo + pnpm |
| 프론트엔드 | Next.js 15 (App Router) |
| 백엔드 | NestJS + MikroORM |
| DB | MySQL 8.0 (Docker) |
| 실시간 | Socket.IO (WebSocket) |
| 인프라 | docker-compose (맥미니 배포) + ngrok |

## 프로젝트 구조

```
apps/
  api/                  ← NestJS 백엔드 (port 3001)
    src/
      auth/             ← 인증 (signup, login, refresh, me)
      household/        ← Household CRUD + 멤버 관리
      item/             ← Item CRUD + 수정 (partial update)
      invite/           ← 초대 링크 생성/수락
      location/         ← 장소 조회/이름변경/삭제
      event/            ← WebSocket Gateway
      common/
        entities/       ← User, Household, HouseholdMember, Item, Invite
        decorators/     ← @CurrentUser
  web/                  ← Next.js 프론트엔드 (port 3000)
    src/
      app/
        api/[...path]/  ← API 프록시 (Route Handler)
        login/          ← 로그인
        signup/         ← 회원가입
        members/        ← 같이 쓰는 사람들
        settings/       ← 설정 (위치 관리)
        invite/[token]/ ← 초대 수락
        page.tsx        ← 홈 (물건 리스트)
      components/
        layout/         ← Header, SideDrawer, FAB
        item/           ← ItemList, ItemRow, ItemFilter, AddItemModal, EditItemModal, DeleteDialog
        ui/             ← EmojiPicker
      lib/
        api.ts          ← API 클라이언트 (토큰 자동 갱신)
        auth.tsx        ← AuthProvider (Context)
        socket.ts       ← Socket.IO 클라이언트
packages/
  shared-types/         ← 공유 타입 (Item, Auth, WsEvent 등)
```

## 스크립트

```bash
# 로컬 개발
pnpm dev                # API + Web 동시 실행
pnpm build              # 전체 빌드

# DB
pnpm schema:create      # 테이블 생성
pnpm schema:update      # 스키마 동기화 (안전)
pnpm schema:drop        # 테이블 삭제
pnpm db:reset           # 초기화 (drop + create)

# Docker (맥미니 배포)
pnpm docker:up          # 빌드 + 기동
pnpm docker:down        # 종료
pnpm docker:logs        # 로그
pnpm deploy             # git pull + docker:up
```

## 환경변수

루트 `.env` 하나로 통합. `.env.example` 참고.

- 로컬 개발: `mikro-orm.config.ts`에서 dotenv로 루트 `.env` 로드
- Docker: `docker-compose.yml`의 `environment`로 주입 (DB_HOST는 `mysql`로 오버라이드)

## 아키텍처 결정사항

- **Item.quantity** (number) — 0이면 "사야 해" 상태 (회색 비활성화). 기존 active(boolean)에서 변경됨
- **아이템 탭 → 수정 모달** — 토글이 아닌 EditItemModal 열림 (partial update)
- **API 프록시** — Next.js Route Handler (`/api/[...path]`)로 프록시. rewrites는 Docker에서 빌드 시점에 고정되는 문제로 사용 안 함
- **WebSocket** — REST로 변경 → EventService → Gateway broadcast. 클라이언트에서 senderId 비교로 자기 이벤트 무시
- **위치 데이터** — Item 엔티티에 space/zone/details 직접 저장. 별도 Location 테이블 없음 (Item에서 distinct 추출)
- **회원가입 시 Household 미생성** — 홈 진입 시 없으면 자동 생성. 초대 가입 흐름과 충돌 방지
- **DB 볼륨** — `~/.db/home-inventory/mysql` 바인드 마운트 (named volume 아님)

## 주의사항

- 패키지 매니저: **pnpm** (npm 사용하지 않음)
- 테이블 alias 사용하지 않고 풀네임 사용
- Guard에서 request 추출, Service에서 순수 로직 — 관심사 분리
- 파라미터 2개 이상이면 단일 객체
- `as` 단언 극도로 기피
