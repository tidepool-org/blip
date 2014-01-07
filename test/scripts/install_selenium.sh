#!/bin/bash -e

# Expected to be run from repo root

# Install ChromeDriver to run E2E tests locally using Chrome
# For other browsers, the Standalone Selenium Server is needed
# See:
# https://code.google.com/p/selenium/wiki/WebDriverJs

CHROMEDRIVER_VERSION=${CHROMEDRIVER_VERSION-2.8}
CHROMEDRIVER_ZIP=${CHROMEDRIVER_ZIP-chromedriver_mac32.zip}
# http://chromedriver.storage.googleapis.com/index.html

mkdir -p test/bin
cd test/bin
curl -O http://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/$CHROMEDRIVER_ZIP
unzip -o $CHROMEDRIVER_ZIP
rm $CHROMEDRIVER_ZIP
cd ../..