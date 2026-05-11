FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/ packages/

RUN npm ci

COPY apps/api/ apps/api/

RUN npm run build --workspace=@hanen-shop/api

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/packages packages
COPY --from=builder /app/apps/api/dist apps/api/dist
COPY apps/api/package.json apps/api/

EXPOSE 3000

CMD ["node", "apps/api/dist/main"]
