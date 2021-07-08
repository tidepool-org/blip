# syntax=docker/dockerfile:experimental

### Stage: Base image
FROM node:10.23.2-alpine as base
WORKDIR /app
RUN mkdir -p dist node_modules .yarn-cache && chown -R node:node .


### Stage: Development root with Chromium installed for unit tests
FROM base as development
ARG I18N_ENABLED=false
ARG RX_ENABLED=false
ARG CLINICS_ENABLED=false
ENV \
  CHROME_BIN=/usr/bin/chromium-browser \
  LIGHTHOUSE_CHROMIUM_PATH=/usr/bin/chromium-browser \
  I18N_ENABLED=$I18N_ENABLED \
  RX_ENABLED=$RX_ENABLED \
  CLINICS_ENABLED=$CLINICS_ENABLED \
  NODE_ENV=development \
  TIDEPOOL_DOCKER_VIZ_DIR=/app/packageMounts/@tidepool/viz
RUN \
  echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
  && apk --no-cache update \
  && apk --no-cache upgrade \
  && apk add --no-cache git fontconfig bash udev ttf-opensans chromium rsync \
  && rm -rf /var/cache/apk/* /tmp/*
# Install package dependancies for blip and mounted packages if present
USER node
RUN mkdir -p /home/node/.yarn-cache /home/node/.cache/yarn
# viz
COPY --chown=node:node packageMounts/@tidepool/viz/stub packageMounts/@tidepool/viz/yarn.lock* packageMounts/@tidepool/viz/package.json* packageMounts/@tidepool/viz/
RUN --mount=type=cache,target=/home/node/.yarn-cache,id=yarn,uid=1000,gid=1000 cd packageMounts/@tidepool/viz && yarn install --cache-folder /home/node/.yarn-cache --silent --no-progress
# blip
COPY --chown=node:node package.json yarn.lock .yarnrc ./
RUN --mount=type=cache,target=/home/node/.yarn-cache,id=yarn,uid=1000,gid=1000 yarn install --cache-folder /home/node/.yarn-cache --silent --no-progress
# tideline
COPY --chown=node:node packageMounts/tideline/stub packageMounts/tideline/yarn.lock* packageMounts/tideline/package.json* packageMounts/tideline/
RUN --mount=type=cache,target=/home/node/.yarn-cache,id=yarn,uid=1000,gid=1000 cd packageMounts/tideline && yarn install --cache-folder /home/node/.yarn-cache --silent --no-progress
# platform-client
COPY --chown=node:node packageMounts/tidepool-platform-client/stub packageMounts/tidepool-platform-client/yarn.lock* packageMounts/tidepool-platform-client/package.json* packageMounts/tidepool-platform-client/
RUN --mount=type=cache,target=/home/node/.yarn-cache,id=yarn,uid=1000,gid=1000 cd packageMounts/tidepool-platform-client && yarn install --cache-folder /home/node/.yarn-cache --silent --no-progress
# Copy the yarn cache mount to the standard yarn cache directory for quicker installs within running containers
RUN --mount=type=cache,target=/home/node/.yarn-cache,id=yarn,uid=1000,gid=1000 (cd /home/node/.yarn-cache; tar cf - .) | (cd /home/node/.cache/yarn; tar xpf -)
# Link any packages as needed
ARG LINKED_PKGS=""
RUN for i in ${LINKED_PKGS//,/ }; do cd packageMounts/${i} && yarn link && cd /app && yarn link ${i}; done
# Copy source files
COPY --chown=node:node . .
CMD ["npm", "start"]


### Stage: Build production-ready release
FROM base as build
# ARGs
ARG API_HOST
ARG PORT=3000
ARG SERVICE_NAME=blip
ARG ROLLBAR_POST_SERVER_TOKEN
ARG I18N_ENABLED=false
ARG RX_ENABLED=false
ARG CLINICS_ENABLED=false
ARG TRAVIS_COMMIT
# Set ENV from ARGs
ENV \
  API_HOST=$API_HOST \
  PORT=$PORT \
  SERVICE_NAME=$SERVICE_NAME \
  ROLLBAR_POST_SERVER_TOKEN=$ROLLBAR_POST_SERVER_TOKEN \
  I18N_ENABLED=$I18N_ENABLED \
  RX_ENABLED=$RX_ENABLED \
  CLINICS_ENABLED=$CLINICS_ENABLED \
  TRAVIS_COMMIT=$TRAVIS_COMMIT \
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
COPY .yarnrc .
# Only install `node_modules` dependancies needed for production
RUN yarn install --production --frozen-lockfile
USER node
# Copy only files needed to run the server
COPY --from=build /app/dist dist
COPY --from=build /app/tilt tilt
COPY --from=build \
  /app/config.server.js \
  /app/package.json \
  /app/server.js \
  ./
CMD ["npm", "run", "server"]
