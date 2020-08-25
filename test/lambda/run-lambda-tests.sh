#!/bin/bash
set -eu
echo "Testing lambda edge"
TEST_DIR=$(dirname $0)
rm -rfv $TEST_DIR/{dist,templates}
mkdir -v $TEST_DIR/{dist,templates}
cp -v dist/* $TEST_DIR/dist
cp -v server/templates/cloudfront-lambda-blip-request-viewer.js $TEST_DIR/templates/
cd $TEST_DIR
TARGET_ENVIRONNEMENT=test API_HOST='https://api.example.com' node ../../server/cloudfront-gen-lambda.js
mocha cloudfront-gen-lambda.test.js
