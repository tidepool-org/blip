#!/bin/sh -eu

rm -rf node_modules

TIME="$(date +%s)"
npm install
TIME="$(($(date +%s)-TIME))"

echo "npm install completed in ${TIME} seconds"

# add configuration
. ./config/env.docker.sh

npm run build
