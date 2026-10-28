FROM node:23-alpine

WORKDIR /app

RUN apk add --no-cache git

RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" PNPM_VERSION=9 sh -

COPY package.json pnpm-lock.yaml ./

COPY . .

WORKDIR /app/packages/web

ARG VITE_API_URL
ARG VITE_WS_URL
ARG VITE_BUILD_VENDOR
ARG VITE_COMMIT_HASH
ARG GIT_SHA
ENV VITE_API_URL=$VITE_API_URL \
    VITE_WS_URL=$VITE_WS_URL \
    VITE_BUILD_VENDOR=$VITE_BUILD_VENDOR \
    VITE_COMMIT_HASH=$VITE_COMMIT_HASH \
    GIT_SHA=$GIT_SHA

RUN . ~/.shrc && pnpm install && pnpm build

FROM nginx:alpine

COPY --from=0 /app/packages/web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
