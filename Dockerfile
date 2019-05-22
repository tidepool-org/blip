### Stage 0 - Base image
FROM node:10.14.2-alpine as base
WORKDIR /app
RUN mkdir -p dist node_modules && chown -R node:node .


### Stage 1 - Base image for development image to install and configure Chromium for unit tests
FROM base as developBase
RUN \
  echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
  && apk --no-cache  update \
  && apk --no-cache  upgrade \
  && apk add --no-cache fontconfig bash udev ttf-opensans chromium \
  && rm -rf /var/cache/apk/* /tmp/*
ENV \
  CHROME_BIN=/usr/bin/chromium-browser \
  LIGHTHOUSE_CHROMIUM_PATH=/usr/bin/chromium-browser \
  NODE_ENV=development


### Stage 2 - Create cached `node_modules`
# Only rebuild layer if `package.json` has changed
FROM base as dependencies
USER node
COPY package.json .
# Ignore scripts during install to prevent `prepare` and `prepublishOnly` from running
RUN npm install --ignore-scripts


### Stage 3 - Development root with Chromium installed for unit tests
FROM developBase as develop
WORKDIR /app
USER node
# Copy all `node_modules` from dependancies layer
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
# Copy source files
COPY --chown=node:node . .
EXPOSE 8082 8083
VOLUME ["/app", "/app/node_modules", "/app/dist"]
CMD ["npm", "start"]
