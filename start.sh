#! /bin/bash -eu

. config/env.sh
./node_modules/.bin/gulp
exec node server