#!/bin/sh
set -eu
# WORK ONLY with the docker images !
# Require TARGET_ENVIRONMENT=test
cd server
npm run gen-lambda
cd ..
rm -v ./static/index.html
# Deploy, move to deployement dir in order to have access to the app in cdk.json
cd cloudfront-dist/deployment
echo "run cdk deploy --require-approval never $STACK_PREFIX_NAME-$FRONT_APP_NAME"
npm run cdk -- deploy --require-approval never $STACK_PREFIX_NAME-$FRONT_APP_NAME
