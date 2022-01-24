#!/bin/bash
set -eu

export TARGET_ENVIRONMENT='test'
export API_HOST='https://api.example.com'
export BRANDING='diabeloop/blue'

FAVICON="$(echo 'const l=require("./branding/branding.json"); console.log(l[process.env.BRANDING].favicon)' | node -)"

rm -rf 'dist'
mkdir -pv 'dist/static'
cp -v 'templates/index.html' 'dist/static/'
cp -v "branding/${FAVICON}" 'dist/static/'
npm run gen-lambda
mocha test/lambda/cloudfront-gen-lambda.test.js
