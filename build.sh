#!/bin/bash -eu
set -ev

npm run lint
npm test

npm run build

# the node version is hardcoded here. 
# any change of selected node version if .travis.yml 
# will require a change here
if [ "${TRAVIS_NODE_VERSION}" != "6.10.2" ]; then
    exit 0
fi

if [ -n "${TRAVIS_TAG:-}" ]; then
    echo 'Publishing on tag ${TRAVIS_TAG}'
    # pack it
    npm pack
    # but do not publish it as the tarball is not working
    # npm publish
fi

