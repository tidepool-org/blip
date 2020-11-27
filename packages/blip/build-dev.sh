#!/bin/sh
set -eu

# add configuration
. ./config/env.docker.sh

export NODE_OPTIONS='--max-old-space-size=4096'
npm run build-dev
