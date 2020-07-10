#!/bin/bash -eu

. "${NVM_DIR}/nvm.sh"
. version.sh

nvm ls "${START_NODE_VERSION}" > /dev/null || { echo "ERROR: Node version ${START_NODE_VERSION} not installed"; exit 1; }
nvm use --delete-prefix "${START_NODE_VERSION}"

. config/env.sh

npm run build-config
exec node server
