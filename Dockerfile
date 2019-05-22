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
  && mkdir -p /@tidepool/viz/node_modules /tideline/node_modules /tidepool-platform-client/node_modules \
  && chown -R node:node /@tidepool /tideline /tidepool-platform-client \
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
RUN \
  # Build and separate all dependancies required for production
  npm install --production && cp -R node_modules production_node_modules \
  # Build all modules, including `devDependancies`
  && npm install


### Stage 3 - Development root with Chromium installed for unit tests
FROM developBase as develop
WORKDIR /app
USER node
# Copy all `node_modules`
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
# Copy source files
COPY --chown=node:node . .
VOLUME ["/app", "/app/node_modules", "/app/dist"]
CMD ["npm", "start"]


### Stage 4 - Linting and unit testing
FROM develop as test
ENV NODE_ENV=test
USER node
CMD ["npm", "test"]


### Stage 5 - Base image for builds to share args and environment variables
FROM base as buildBase
# ARGs
ARG API_HOST
ARG DISCOVERY_HOST=hakken:8000
ARG PORT=3000
ARG PUBLISH_HOST=hakken
ARG SERVICE_NAME=blip
# Set ENV from ARGs
ENV \
  API_HOST=$API_HOST \
  DISCOVERY_HOST=$DISCOVERY_HOST \
  PORT=$PORT \
  PUBLISH_HOST=$PUBLISH_HOST \
  SERVICE_NAME=$SERVICE_NAME \
  NODE_ENV=production


### Stage 6 - Build production-ready release
FROM buildBase as build
USER node
# Copy all `node_modules` from `dependancies` layer
COPY --from=dependencies /app/node_modules ./node_modules
# Copy source files, and possibily invalidate so we have to rebuild
COPY . .
RUN npm run build


### Stage 7 - Serve production-ready release
FROM buildBase as serve
USER node
# Copy only `node_modules` and files needed to run the server
COPY --from=dependencies /app/production_node_modules ./node_modules
COPY --from=build /app/dist dist
COPY --from=build \
  /app/config.server.js \
  /app/package.json \
  /app/server.js \
  ./
CMD ["npm", "run", "server"]
