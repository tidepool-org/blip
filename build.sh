#! /bin/bash -eu

rm -rf node_modules
npm install --production
./node_modules/.bin/bower install
./node_modules/.bin/gulp