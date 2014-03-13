#!/bin/bash

npm install bower
bower install
browserify test/*util.js -o test/test.js