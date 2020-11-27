#!/bin/bash
set -eu

export TARGET_ENVIRONMENT='test'
export API_HOST='https://api.example.com'

rm -rf 'dist'
mkdir -pv 'dist/static'
cp -v 'templates/index.html' 'dist/static/'
cp -v 'branding/diabeloop/favicon.ico' 'dist/static/'
npm run gen-lambda
mocha test/lambda/cloudfront-gen-lambda.test.js
