FROM node:6.10.3-alpine

# Common ENV
ENV API_SECRET="This is a local API secret for everyone. BsscSHqSHiwrBMJsEGqbvXiuIUPAjQXU" \
    SERVER_SECRET="This needs to be the same secret everywhere. YaHut75NsK1f9UKUXuWqxNN0RUwHFBCy" \
    LONGTERM_KEY="abcdefghijklmnopqrstuvwxyz" \
    DISCOVERY_HOST=hakken:8000 \
    PUBLISH_HOST=hakken \
    METRICS_SERVICE="{ \"type\": \"static\", \"hosts\": [{ \"protocol\": \"http\", \"host\": \"highwater:9191\" }] }" \
    USER_API_SERVICE="{ \"type\": \"static\", \"hosts\": [{ \"protocol\": \"http\", \"host\": \"shoreline:9107\" }] }" \
    SEAGULL_SERVICE="{ \"type\": \"static\", \"hosts\": [{ \"protocol\": \"http\", \"host\": \"seagull:9120\" }] }" \
    GATEKEEPER_SERVICE="{ \"type\": \"static\", \"hosts\": [{ \"protocol\": \"http\", \"host\": \"gatekeeper:9123\" }] }" \
    PORT=3000 \
    MOCK=false \
    DEV_TOOLS=true \
    WEBPACK_DEVTOOL="cheap-module-eval-source-map" \
    API_HOST="http://localhost:8009" \
    UPLOAD_API="http://localhost/uploader"

WORKDIR /app

COPY package.json /app/package.json

RUN apk add --no-cache fontconfig \
 && apk add --no-cache --virtual .build-deps curl git \
 && echo "Fixing PhantomJS to run on alpine" \
 && curl -Ls "https://github.com/tidepool-org/tools/raw/master/alpine_phantomjs_dependencies/dockerized-phantomjs.tar.xz" | tar xJ -C / \
 && mkdir /app/dist && mkdir /app/node_modules && chown node:node -R /app \
 && mkdir -p /@tidepool/viz/node_modules && chown node:node -R /@tidepool \
 && mkdir -p /tideline/node_modules && chown node:node -R /tideline \
 && mkdir -p /tidepool-platform-client/node_modules && chown node:node -R /tidepool-platform-client \
 && apk del .build-deps \
 && rm -rf /usr/share/man /tmp/* /var/tmp/* /root/.npm /root/.node-gyp

USER node

RUN yarn install

COPY . /app

VOLUME /app

EXPOSE 3000

CMD ["npm", "start"]
