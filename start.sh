#! /bin/bash -eu

source "${NVM_DIR}/nvm.sh"
source "deploy-env.sh"

nvm ls "${DEPLOY_NODE_VERSION}" > /dev/null || { echo "ERROR: Node version ${DEPLOY_NODE_VERSION} not installed"; exit 1; }
nvm use --delete-prefix "${DEPLOY_NODE_VERSION}"

. config/env.sh
npm run build-config
exec node server
