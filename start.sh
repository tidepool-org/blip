#! /bin/bash -eu

. config/env.sh
./node_modules/.bin/gulp scripts-config
exec node server