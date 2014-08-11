#! /bin/bash -eu

. config/env.sh
npm run build-config
exec node server
