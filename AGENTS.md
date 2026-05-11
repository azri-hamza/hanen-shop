# hanen-shop — Coding Preferences & Rules

## Project Overview
Full-stack monorepo for a shop management application (inventory + customer ledger).
- **API**: NestJS + TypeORM + PostgreSQL (migrations only, `synchronize: false`)
- **Web**: Angular 18+ standalone components, Material UI, strict TS, lazy-loaded routes
- **Mobile**: React Native + Expo SDK 54, TanStack Query, react-native-paper, FlashList
- **Packages**: `@hanen-shop/shared-types`, `@hanen-shop/api-client` (Axios-based)

## Package Manager & Tooling
- **pnpm** (v9.x) — use `pnpm install`, NOT npm
- **Turborepo** for task orchestration (`turbo.json`)
- Workspace protocol: always use `"workspace:*"` (not bare `"*"`) for inter-package deps
- Engine requirement: Node >= 20

## Project Structure
```
apps/api/          — NestJS backend
apps/web/          — Angular frontend
apps/mobile/       — React Native + Expo mobile app
packages/shared-types/  — Shared TypeScript enums & interfaces
packages/api-client/    — Shared Axios HTTP client
```

## Code Conventions

### General
- TypeScript strict mode throughout all packages/apps
- 2-space indentation, LF line endings, UTF-8
- Trailing whitespace trimmed (except .md files)
- Insert final newline on all files

### NestJS (apps/api)
- Modules/entities use **plural** directory names: `products/`, `customers/`, `transactions/`
- All DTO fields must have `class-validator` decorators
- Controllers decorated with Swagger `@ApiTags`, `@ApiOperation`, `@ApiResponse`
- Sale creation: QueryRunner transaction with stock validation, unitPrice snapshot, stock decrement, totalDebt recalculation
- Payment creation: QueryRunner transaction, totalDebt recalculation (decreases)
- **Transactions are immutable** — no PUT/DELETE endpoints, only POST + GET
- Services: proper try/catch with meaningful error propagation
- Use `@nestjs/throttler` (100 req/min per IP)
- Use `helmet` + `cors` with restrictive defaults
- Use `@nestjs/pino` (Pino logger) — not default NestJS logger
- Health check: `GET /health` via `@nestjs/terminus`
- Request logging interceptor: log method, path, statusCode, duration

### Angular (apps/web)
- Fully standalone components (no NgModules), `loadChildren` for lazy feature chunks
- `moduleResolution: "bundler"` in tsconfig; forced `paths` for rxjs
- `allowedCommonJsDependencies` in angular.json: `@hanen-shop/api-client`, `@hanen-shop/shared-types`, `axios`
- State management: **NgRx Signals** (not NgRx Store)
- Material Design with violet/rose palette
- Testing: **Vitest** + Angular Testing Library (not Karma)
  - Environment: jsdom, globals: true
  - Vitest config at `apps/web/vitest.config.ts`
  - Use `@testing-library/angular`, `@testing-library/user-event`
  - `screen.getByRole`, `screen.getByLabelText`, `userEvent.type` for interactions
  - Mock ApiService using Jest mocks (`jest.spyOn`)

### React Native / Expo (apps/mobile)
- Data fetching: **TanStack Query** (caching + auto-invalidation)
  - `staleTime: 30_000` (30s)
  - Mutations invalidate related queries on success
- UI: react-native-paper, FlashList for long lists (not ScrollView/FlatList)
- Expo SDK 54
- No unit tests for v1 (skip Jest/Testing Library setup)

### Packages
- `@hanen-shop/shared-types`: strict TS, outputs `dist/`
  - Includes: `TransactionType` enum, `IProduct`, `ICustomer`, `ITransaction`, `ITransactionItem`, `ISaleItem` interfaces
- `@hanen-shop/api-client`: Axios-based class with `get/post/put/patch/delete`
  - Consistent error shape and response handling across all apps

## Visual Conventions
- **Stock colors**: red = 0, yellow = ≤5, green = rest
- **Debt colors**: green = 0, yellow = < 1000, red = ≥ 1000
- Sale steps: customer autocomplete → product picker → confirm with total
- Page titles set via Angular `Title` service
- Loading skeletons on all list screens (MatSkeleton or CSS)
- Empty state component shown when lists are empty

## Build & Run Commands
```bash
pnpm install                       # install all deps
pnpm run dev                       # turbo dev (all apps)
pnpm run dev:api                   # API only
pnpm run dev:web                   # Web only
pnpm run dev:mobile                # Mobile only
pnpm run build                     # turbo build
pnpm run test                      # turbo test
pnpm run lint                      # turbo lint
pnpm run typecheck                 # turbo typecheck
pnpm run clean                     # turbo clean
```

## Docker
- Dev: `docker compose -f docker-compose.dev.yml up -d` (Postgres 16-alpine)
- Prod: `docker compose -f docker-compose.prod.yml up -d`

## Critical Constraints
- **Transactions are immutable** — never add PUT/DELETE for transactions
- **Migrations only** — `synchronize: false` in TypeORM config
- **Sale flow**: validates stock → snapshots unitPrice → decrements stock → recalculates totalDebt (sum of all transactions)
- **Payment flow**: creates PAYMENT record → recalculates totalDebt (decreases it)
- Environment variables via `DATABASE_URL`, `PORT`, `CORS_ORIGIN`, `LOG_LEVEL`
