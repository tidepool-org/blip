FROM node:6.10.3-alpine

WORKDIR /app

COPY package.json package.config.js webpack.config.js /app/

RUN apk add --no-cache fontconfig \
 && apk add --no-cache --virtual .build-deps curl git \
 && echo "Fixing PhantomJS to run on alpine" \
 && curl -Ls "https://github.com/tidepool-org/tools/raw/master/alpine_phantomjs_dependencies/dockerized-phantomjs.tar.xz" | tar xJ -C / \
 && mkdir /app/dist && chown node:node -R /app/dist && chmod -R 755 /app/dist \
 && yarn install \
 && apk del .build-deps \
 && rm -rf /usr/share/man /tmp/* /var/tmp/* /root/.npm /root/.node-gyp

COPY . /app

USER node

EXPOSE 8081

CMD ["npm", "start"]
