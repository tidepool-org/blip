#! /bin/bash -eu

rm -rf node_modules
npm install --production
npm dedupe
npm run build-app
