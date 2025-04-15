#!/bin/sh -eu

rm -rf node_modules

TIME="$(date +%s)"
yarn install --immutable
TIME="$(($(date +%s)-TIME))"

echo "yarn install completed in ${TIME} seconds"

yarn build-app
