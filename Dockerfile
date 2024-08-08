# syntax=docker/dockerfile:experimental

### Stage: Base image
FROM node:20.8.0-alpine as base
WORKDIR /app
RUN corepack enable \
  && yarn set version 3.6.4 \
  && mkdir -p dist node_modules .yarn-cache .yarn && chown -R node:node .


### Stage: Development root with Chromium installed for unit tests
FROM base as development
ARG LAUNCHDARKLY_CLIENT_TOKEN
ARG I18N_ENABLED=false
ARG PENDO_ENABLED=true
ENV \
  LAUNCHDARKLY_CLIENT_TOKEN=$LAUNCHDARKLY_CLIENT_TOKEN \
  I18N_ENABLED=$I18N_ENABLED \
  PENDO_ENABLED=$PENDO_ENABLED \
  NODE_ENV=development \
  TIDEPOOL_DOCKER_VIZ_DIR=/app/packageMounts/@tidepool/viz
RUN \
  echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
  && apk --no-cache update \
  && apk --no-cache upgrade \
  && apk add --no-cache git fontconfig bash udev ttf-opensans rsync \
  # && apk add --no-cache git fontconfig bash udev ttf-opensans chromium rsync \
  && rm -rf /var/cache/apk/* /tmp/*
# Install package dependancies for blip and mounted packages if present
USER node
RUN mkdir -p /home/node/.yarn-cache /home/node/.cache/yarn && yarn config set cacheFolder /home/node/.yarn-cache
# viz
COPY --chown=node:node packageMounts/@tidepool/viz/stub packageMounts/@tidepool/viz/yarn.lock* packageMounts/@tidepool/viz/package.json* packageMounts/@tidepool/viz/
RUN --mount=type=cache,target=/home/node/.yarn-cache,id=yarn,uid=1000,gid=1000 cd packageMounts/@tidepool/viz && yarn install --silent
# blip
COPY --chown=node:node package.json yarn.lock .yarnrc.yml ./
RUN --mount=type=cache,target=/home/node/.yarn-cache,id=yarn,uid=1000,gid=1000 yarn install --silent
# tideline
COPY --chown=node:node packageMounts/tideline/stub packageMounts/tideline/yarn.lock* packageMounts/tideline/package.json* packageMounts/tideline/
RUN --mount=type=cache,target=/home/node/.yarn-cache,id=yarn,uid=1000,gid=1000 cd packageMounts/tideline && yarn install --silent
# platform-client
COPY --chown=node:node packageMounts/tidepool-platform-client/stub packageMounts/tidepool-platform-client/yarn.lock* packageMounts/tidepool-platform-client/package.json* packageMounts/tidepool-platform-client/
RUN --mount=type=cache,target=/home/node/.yarn-cache,id=yarn,uid=1000,gid=1000 cd packageMounts/tidepool-platform-client && yarn install --silent
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
ARG REALM_HOST
ARG PORT=3000
ARG SERVICE_NAME=blip
ARG ROLLBAR_POST_SERVER_TOKEN
ARG LAUNCHDARKLY_CLIENT_TOKEN
ARG I18N_ENABLED=false
ARG PENDO_ENABLED=true
ARG TRAVIS_COMMIT
# Set ENV from ARGs
ENV \
  API_HOST=$API_HOST \
  REALM_HOST=$REALM_HOST \
  PORT=$PORT \
  SERVICE_NAME=$SERVICE_NAME \
  ROLLBAR_POST_SERVER_TOKEN=$ROLLBAR_POST_SERVER_TOKEN \
  LAUNCHDARKLY_CLIENT_TOKEN=$LAUNCHDARKLY_CLIENT_TOKEN \
  I18N_ENABLED=$I18N_ENABLED \
  PENDO_ENABLED=$PENDO_ENABLED \
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
COPY .yarnrc.yml .
RUN yarn plugin import workspace-tools && yarn workspaces focus --production
# Copy only files needed to run the server
COPY --from=build /app/dist dist
COPY --from=build /app/tilt tilt
COPY --from=build \
  /app/config.server.js \
  /app/package.json \
  /app/server.js \
  ./
CMD ["node", "server"]
