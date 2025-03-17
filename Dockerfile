FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git

RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -

COPY package.json pnpm-lock.yaml ./

RUN . ~/.shrc && pnpm install

COPY . .

WORKDIR /app/packages/web

RUN . ~/.shrc && pnpm build

FROM nginx:alpine

COPY --from=0 /app/packages/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
