#!/bin/bash -eu
set -ev

echo "Installing"
yarn 

echo 'Run testing'
npm test
npm run build

if [ "${TRAVIS_NODE_VERSION}" != "6.10.2" ]; then
    exit 0
fi

if [ -n "${TRAVIS_TAG:-}" ]; then
    echo 'Publishing on tag ${TRAVIS_TAG}'
    npm publish
fi
