# hanen-shop

Full-stack monorepo for a shop management application.

## Prerequisites

- Node.js >= 20
- npm >= 10
- PostgreSQL 16+
- Expo CLI (`npm install -g expo-cli`) for mobile development

## Setup

```bash
# Install all dependencies
npm install

# Build shared packages first
npm run build --workspace=packages/shared-types
npm run build --workspace=packages/api-client

# Build all apps
npm run build:all
```

## Environment Variables

Copy the example env file and adjust as needed:

```bash
cp .env.docker.example .env
```

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://hanen:hanen@localhost:5432/hanen_shop` |
| `PORT` | API server port | `3000` |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:4200` |
| `LOG_LEVEL` | Pino log level | `info` |
| `POSTGRES_USER` | DB user (Docker only) | `hanen` |
| `POSTGRES_PASSWORD` | DB password (Docker only) | `hanen` |
| `POSTGRES_DB` | DB name (Docker only) | `hanen_shop` |

## Running

### All apps (development)

```bash
npm run dev:all
```

### Individual apps

```bash
# API (NestJS) - http://localhost:3000
npm run dev:api

# Web (Angular) - http://localhost:4200
npm run dev:web

# Mobile (React Native + Expo)
npm run dev:mobile
```

### Docker

```bash
docker compose up -d
```

### Database Migrations

```bash
npm run migration:run --workspace=@hanen-shop/api
npm run migration:generate --workspace=@hanen-shop/api -- <MigrationName>
```

## Structure

```
hanen-shop/
├── apps/
│   ├── api/          NestJS backend (PostgreSQL + TypeORM)
│   ├── web/          Angular 18+ frontend (Material UI)
│   └── mobile/       React Native + Expo mobile app
├── packages/
│   ├── shared-types/ Shared TypeScript interfaces and enums
│   └── api-client/   Type-safe Axios HTTP client
├── docker-compose.yml
├── turbo.json
└── package.json
```

## API Documentation

Swagger UI is available at `/api/docs` when the API is running.

## Health Check

```
GET /health
```

## Testing

```bash
# Run all tests
npm run test:all

# API tests (Jest)
npm run test --workspace=@hanen-shop/api

# Web tests (Vitest)
npm run test --workspace=@hanen-shop/web
```

## Linting

```bash
npm run lint:all
```
