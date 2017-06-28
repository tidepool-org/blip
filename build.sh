#!/bin/sh -eu

TIME="$(date +%s)"
node ./yarn-0.25.3.js --production
TIME="$(($(date +%s)-TIME))"

echo "yarn install completed in ${TIME} seconds"

node ./yarn-0.25.3.js build-app
