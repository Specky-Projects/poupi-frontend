FROM node:24-alpine AS deps

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/poupi-baby/package.json apps/poupi-baby/package.json
COPY packages/api-client/package.json packages/api-client/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/utils/package.json packages/utils/package.json

RUN pnpm install --frozen-lockfile

FROM node:24-alpine AS builder

WORKDIR /app
RUN corepack enable

ARG NEXT_PUBLIC_API_URL=https://api.example.com
ARG BACKEND_URL=https://api.example.com
ARG NEXT_PUBLIC_SITE_URL=https://www.example.com

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV BACKEND_URL=$BACKEND_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app ./
COPY . .

RUN NEXTAUTH_SECRET=build-placeholder-secret pnpm --filter @poupi-frontend/poupi-baby build

FROM node:24-alpine AS runner

WORKDIR /app
RUN corepack enable

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app ./

EXPOSE 3000

CMD ["pnpm", "--filter", "@poupi-frontend/poupi-baby", "start"]
