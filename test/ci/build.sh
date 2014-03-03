#!/bin/bash

if [ "$TEST_SUITE" == "unit" ]; then
  ./node_modules/.bin/gulp before-tests
elif [ "$TEST_SUITE" == "e2e" ]; then
  ./node_modules/.bin/gulp
  node server &
  sleep 1
else
  echo "Unknown test suite. Please set TEST_SUITE=unit or TEST_SUITE=e2e."
fi