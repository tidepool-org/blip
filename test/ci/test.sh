#!/bin/bash

if [ "$SAUCE_USERNAME" ]; then
  if [ "$TEST_SUITE" == "unit" ]; then
    ./node_modules/.bin/grunt test-saucelabs-travis
  elif [ "$TEST_SUITE" == "e2e" ]; then
    make test-e2e
  else
    echo "Unknown test suite. Please set TEST_SUITE=unit or TEST_SUITE=e2e."
  fi
else
  echo "No SAUCE_USERNAME env variable, skipping Sauce Labs tests."
fi
