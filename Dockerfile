### Stage 0 - Base image
FROM node:10.14.2-alpine as base
WORKDIR /app
RUN mkdir -p dist node_modules && chown -R node:node .


### Stage 1 - Base image for development image to install and configure Chromium for unit tests
FROM base as develop-base
RUN \
  echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
  && apk --no-cache update \
  && apk --no-cache upgrade \
  && apk add --no-cache git fontconfig bash udev ttf-opensans chromium \
  && rm -rf /var/cache/apk/* /tmp/*
ENV \
  CHROME_BIN=/usr/bin/chromium-browser \
  LIGHTHOUSE_CHROMIUM_PATH=/usr/bin/chromium-browser \
  NODE_ENV=development


### Stage 2 - Create cached `node_modules`
# Only rebuild layer if `package.json` has changed
FROM base as dependencies
RUN apk --no-cache update \
  && apk --no-cache upgrade \
  && apk add --no-cache git
COPY package.json .
COPY yarn.lock .
RUN \
  # Build and separate all dependancies required for production
  yarn install --production && cp -R node_modules production_node_modules \
  # Build all modules, including `devDependancies`
  && yarn install
COPY packageMounts/stub packageMounts/tideline/yarn.lock* packageMounts/tideline/package.json* /app/packageMounts/tideline/
COPY packageMounts/stub packageMounts/tidepool-platform-client/yarn.lock* packageMounts/tidepool-platform-client/package.json*  /app/packageMounts/tidepool-platform-client/
COPY packageMounts/stub packageMounts/@tidepool/viz/yarn.lock* packageMounts/@tidepool/viz/package.json* /app/packageMounts/@tidepool/viz/
ARG LINKED_PKGS=""
RUN \
  # Build all modules for mounted packages (used when npm linking in development containers)
  for i in ${LINKED_PKGS//,/ }; do cd /app/packageMounts/${i} && yarn install; done \
  && yarn cache clean


### Stage 3 - Development root with Chromium installed for unit tests
FROM develop-base as development
ENV NODE_ENV=development
WORKDIR /app
# Copy all `node_modules` dependencies
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node --from=dependencies /app/packageMounts ./packageMounts
# Copy source files
COPY --chown=node:node . .
# Link any packages as needed
USER node
ARG LINKED_PKGS=""
RUN for i in ${LINKED_PKGS//,/ }; do cd /app/packageMounts/${i} && yarn link && cd /app && yarn link ${i}; done
CMD ["npm", "start"]


### Stage 4 - Linting and unit testing
FROM development as test
ENV NODE_ENV=test
USER node
CMD ["npm", "test"]


### Stage 5 - Base image for builds to share args and environment variables
FROM base as build-base
# ARGs
ARG API_HOST
ARG DISCOVERY_HOST=hakken:8000
ARG PORT=3000
ARG PUBLISH_HOST=hakken
ARG SERVICE_NAME=blip
ARG ROLLBAR_POST_SERVER_TOKEN
# Set ENV from ARGs
ENV \
  API_HOST=$API_HOST \
  DISCOVERY_HOST=$DISCOVERY_HOST \
  PORT=$PORT \
  PUBLISH_HOST=$PUBLISH_HOST \
  SERVICE_NAME=$SERVICE_NAME \
  ROLLBAR_POST_SERVER_TOKEN=$ROLLBAR_POST_SERVER_TOKEN \
  NODE_ENV=production


### Stage 6 - Build production-ready release
FROM build-base as build
USER node
# Copy all `node_modules` from `dependancies` layer
COPY --from=dependencies /app/node_modules ./node_modules
# Copy source files, and possibily invalidate so we have to rebuild
COPY . .
RUN npm run build


### Stage 7 - Serve production-ready release
FROM build-base as production
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
