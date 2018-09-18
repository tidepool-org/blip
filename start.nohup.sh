#!/bin/bash -eu

. "${NVM_DIR}/nvm.sh"
. version.sh

service=${1:-'blip'}

nvm ls "${START_NODE_VERSION}" > /dev/null || { echo "ERROR: Node version ${START_NODE_VERSION} not installed"; exit 1; }
nvm use --delete-prefix "${START_NODE_VERSION}"

. config/env.sh
# test if build file does not exist
build="build.output"
if [ ! -f ${build} ]; then
    echo "build-app"
    # create the build file the first
    npm run build-app >> "$build"
fi
echo "build-config"
npm run build-config
nohup node server > ../$service.log 2> ../$service.error.log <&- &
