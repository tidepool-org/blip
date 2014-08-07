#! /bin/bash -eu

. config/env.sh
npm run build-config
exec npm run server
