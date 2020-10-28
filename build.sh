#!/bin/sh
set -eu

# add configuration
source ./config/env.docker.sh
source ./artifact-lang.sh

export NODE_OPTIONS='--max-old-space-size=4096'
retrieveLanguageParameters
npm run build
