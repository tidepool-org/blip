#!/bin/sh
set -eu
npm run build-config
exec node server.js
