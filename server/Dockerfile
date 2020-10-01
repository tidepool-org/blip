FROM node:10-alpine AS base
RUN apk --no-cache update && \
  apk --no-cache upgrade && \
  apk add --no-cache --virtual .user-deps shadow && \
  usermod -u 10669 node && groupmod -g 10669 node && \
  apk del .user-deps

FROM base AS buildServer
WORKDIR /app
COPY ./dist/static ./dist
COPY ./server .
RUN chown -R node:node /app
ENV NODE_ENV=production
RUN npm install

FROM buildServer AS production
USER node
CMD [ "node", "server.js", "dist" ]
