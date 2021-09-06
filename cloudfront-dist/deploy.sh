#!/bin/sh
set -eu
# WORK ONLY with the docker images !
# Require TARGET_ENVIRONMENT=test
echo "Current user: $(whoami)"
cd server
npm run gen-robot
npm run gen-sitemap
npm run gen-lambda
cd ..
rm -v ./static/index.html
# Deploy, move to deployement dir in order to have access to the app in cdk.json
cd cloudfront-dist/deployment
echo "run cdk deploy --require-approval never $STACK_PREFIX_NAME-$FRONT_APP_NAME"
npm run cdk -- deploy --require-approval never $STACK_PREFIX_NAME-$FRONT_APP_NAME

# https://developers.google.com/search/docs/advanced/sitemaps/build-sitemap#addsitemap
if [ "${ALLOW_SEARCH_ENGINE_ROBOTS}" = "true" ]
then
  echo "Notify google about the change"
  curl "https://www.google.com/ping?sitemap=https://${DOMAIN_NAME}/sitemap.xml"
else
  echo "Search engine not allowed, not pinging google"
fi
