#! /bin/bash -eu

rm -rf node_modules
T="$(date +%s)"
npm install --production
T="$(($(date +%s)-T))"
echo "npm install completed in ${T} seconds"
npm dedupe
NODE_ENV=production npm run build-app
