### Stage: Base image
FROM node:10.14.2-alpine as base
USER node
WORKDIR /app
RUN mkdir -p dist node_modules


### Stage: Development root with Chromium installed for unit tests
FROM base as development
ARG LINKED_PKGS=""
USER root
ENV \
  CHROME_BIN=/usr/bin/chromium-browser \
  LIGHTHOUSE_CHROMIUM_PATH=/usr/bin/chromium-browser \
  NODE_ENV=development
RUN \
  echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
  && apk --no-cache update \
  && apk --no-cache upgrade \
  && apk add --no-cache git fontconfig bash udev ttf-opensans chromium \
  && rm -rf /var/cache/apk/* /tmp/*
# Install package dependancies
COPY --chown=node:node package.json .
COPY --chown=node:node yarn.lock .
USER node
RUN yarn install
USER root
# Build all modules for mounted packages (used when npm linking in development containers)
COPY --chown=node:node packageMounts/tideline/yarn.lock* packageMounts/tideline/package.json* /app/packageMounts/tideline/
COPY --chown=node:node packageMounts/tidepool-platform-client/yarn.lock* packageMounts/tidepool-platform-client/package.json*  /app/packageMounts/tidepool-platform-client/
COPY --chown=node:node packageMounts/@tidepool/viz/yarn.lock* packageMounts/@tidepool/viz/package.json* /app/packageMounts/@tidepool/viz/
USER node
RUN ls -al /app/packageMounts/@tidepool/viz/
RUN for i in ${LINKED_PKGS//,/ }; do cd /app/packageMounts/${i} && yarn install; done
# Copy source files
COPY --chown=node:node . .
# Link any packages as needed
RUN for i in ${LINKED_PKGS//,/ }; do cd /app/packageMounts/${i} && yarn link && cd /app && yarn link ${i}; done
CMD ["npm", "start"]


### Stage: Build production-ready release
FROM base as build
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
USER node
# Copy all `node_modules` from `development` layer
COPY --from=development /app/node_modules ./node_modules
# Copy source files, and possibily invalidate so we have to rebuild
COPY . .
RUN npm run build


### Stage: Serve production-ready release
FROM base as production
RUN apk --no-cache update \
  && apk --no-cache upgrade \
  && apk add --no-cache git
COPY package.json .
COPY yarn.lock .
# Only install `node_modules` dependancies needed for production
RUN yarn install --production
USER node
# Copy only files needed to run the server
COPY --from=build /app/dist dist
COPY --from=build \
  /app/config.server.js \
  /app/package.json \
  /app/server.js \
  ./
CMD ["npm", "run", "server"]
