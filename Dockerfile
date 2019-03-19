FROM node:10.15-alpine

WORKDIR /app

RUN apk --no-cache update && \
    apk --no-cache upgrade && \
    apk add --no-cache fontconfig && \
    apk add --no-cache --virtual .build-dependencies curl git

COPY package.json package.json
RUN npm install npm@6


RUN chown -R node:node .

USER node
RUN npm install --production

COPY . .

RUN source ./config/env.docker.sh && \
    npm run build

CMD ["npm", "run", "server"]
