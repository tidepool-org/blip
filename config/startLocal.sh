#!/usr/bin/env sh
if node -e "require(__dirname + '/config/local').listLinkedPackages()" | grep -qF '@tidepool/viz'; then  npm run startWithViz; else npm run start; fi
