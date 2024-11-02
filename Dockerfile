FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git

RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -

COPY package.json pnpm-lock.yaml ./

RUN . ~/.shrc && pnpm install

COPY . .

WORKDIR /app/packages/web

RUN . ~/.shrc && pnpm build

EXPOSE 5333

CMD ["npx", "serve", "-s", "dist", "-l", "5333"]
