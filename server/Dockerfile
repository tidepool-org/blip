FROM node:10.15.3-alpine AS base
RUN apk --no-cache update && \
  apk --no-cache upgrade && \
  apk add --no-cache --virtual .user-deps shadow && \
  usermod -u 10669 node && groupmod -g 10669 node && \
  apk del .user-deps

FROM base AS buildServer
WORKDIR /app
COPY . .
RUN chown -R node:node /app/dist

FROM buildServer AS production
USER node
ENTRYPOINT [ "/bin/sh" ]
CMD [ "start-docker.sh" ]
