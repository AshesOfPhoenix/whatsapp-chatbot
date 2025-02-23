FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm i -g pnpm

RUN pnpm install

COPY . .

RUN pnpm prisma generate --schema=./db/prisma/schema.prisma

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start:prod"]
