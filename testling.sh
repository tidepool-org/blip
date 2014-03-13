#!/bin/bash

bower install
browserify test/*util.js -o test/test.js