#!/bin/bash
set -eu
BASEDIR="$(dirname $0)"
APP_NAME="$(echo 'const c = require("./package.json"); console.log(c.name);' | node -)"
export APP_VERSION="$(echo 'const c = require("./package.json"); console.log(c.version);' | node -)"

echo "Running artifacts for ${APP_NAME} v${APP_VERSION}"

wget -q -O artifact_packaging.sh 'https://raw.githubusercontent.com/mdblp/tools/dblp/artifact/artifact_packaging.sh'

NO_DEFAULT_PACKAGING="true"
source ./artifact_packaging.sh

if [ ! -d "node_modules" ]; then
  npm install
fi

bash build.sh

# CloudFront Lambda edge tests:
npm run test-cloudfront

# Publish only on the main node version build
# TODO: Get node version using: "$(node --version | cut -c 2-)" to make this script usable on another build system ?
echo ${TRAVIS_NODE_VERSION:-0.0.0}
if [ "10.15.3" = "${TRAVIS_NODE_VERSION:-0.0.0}" ]; then
  buildDockerImage -f "cloudfront-dist/Dockerfile.deployment" -d . -t "latest" -r "blip-deployment" -s "final"
  publishDockerImage
  npm install --save-dev "ci-toolbox@latest"
  BUILD_SOUP="true"
  buildSOUP
else
  echo "Not publishing docker image: Node version ${TRAVIS_NODE_VERSION:-0.0.0}"
fi
