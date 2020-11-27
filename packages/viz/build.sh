#!/bin/bash -eu
set -ev

npm run build

if [ "${TRAVIS_NODE_VERSION}" != "10.15.3" ]; then
    exit 0
fi

if [ -n "${TRAVIS_TAG:-}" ]; then
    echo 'Publishing on tag ${TRAVIS_TAG}'
    npm publish
fi
