FROM node:10.15.3-alpine AS base
RUN apk --no-cache update \
  && apk --no-cache upgrade

FROM base AS buildServer
WORKDIR /app
COPY . .
RUN \
  chown -v node /app/dist/index.html \
  && chown -v node /app/dist

FROM buildServer AS production
USER node
ENTRYPOINT [ "/bin/sh" ]
CMD [ "start-docker.sh" ]
