#!/bin/sh -eu

rm -rf node_modules

TIME="$(date +%s)"
npm install --production
TIME="$(($(date +%s)-TIME))"

echo "npm install completed in ${TIME} seconds"

npm dedupe
npm run build-app
