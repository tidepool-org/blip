FROM node:10.15.3-alpine

WORKDIR /app

RUN apk --no-cache update && \
    apk --no-cache upgrade && \
    apk add --no-cache fontconfig && \
    apk add --no-cache --virtual .build-dependencies curl git

COPY package.json package.json
#COPY package-lock.json package-lock.json

RUN chown -R node:node .

USER node
RUN export nexus_token='' && npm install

COPY . .

RUN source ./config/env.docker.sh && \
    npm run build

CMD ["npm", "run", "server"]
