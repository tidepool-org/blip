#!/bin/bash -eu
set -ev

echo 'before test'
npm test

if [ "${TRAVIS_NODE_VERSION}" != "6.10.2" ]; then
    exit 0
fi

echo 'after test/before build'
ls -la
npm run build
echo 'after build'
ls -la
npm publish
echo 'befor publish'
ls -la

if [ -n "${TRAVIS_TAG:-}" ]; then
    npm pack
    npm publish
fi
