FROM node:6.10.3-alpine

# Common ENV
ENV PORT=3000

WORKDIR /app

COPY package.json /app/package.json
RUN apk add --no-cache --virtual .build-deps curl git \
 && echo "Fixing PhantomJS to run on alpine" \
 && curl -Ls "https://github.com/dustinblackman/phantomized/releases/download/2.1.1/dockerized-phantomjs.tar.gz" | tar xz -C / \
 && echo "Re-adding node group and user, removed from PhantomJS fix" \
 && addgroup -g 1000 node \
 && adduser -u 1000 -G node -s /bin/sh -D node \
 && yarn install \
 && apk del .build-deps \
 && rm -rf /usr/share/man /tmp/* /var/tmp/* /root/.npm /root/.node-gyp

COPY . /app

USER node

EXPOSE 3000 8081

CMD ["npm", "start"]
