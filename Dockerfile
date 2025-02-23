FROM node:20-alpine

WORKDIR /app

RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./

RUN npm i -g pnpm

RUN pnpm install

COPY . .

RUN pnpm prisma generate --schema=./db/prisma/schema.prisma

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start:prod"]
