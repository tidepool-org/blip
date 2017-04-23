#!/bin/bash -e

if [ -z "${TRAVIS_TAG}" ]; then
  exit 0
fi

set -u

source "deploy-env.sh"

if [ "${TRAVIS_NODE_VERSION}" != "${DEPLOY_NODE_VERSION}" ]; then
  exit 0
fi

TMP_DIR="/tmp/${TRAVIS_REPO_SLUG}"

DEPLOY="${TRAVIS_REPO_SLUG#tidepool-org/}"
DEPLOY_DIR="deploy/${DEPLOY}"

DEPLOY_TAG="${DEPLOY}-${TRAVIS_TAG}"
DEPLOY_TAG_DIR="${DEPLOY_DIR}/${DEPLOY_TAG}"

rm -rf deploy/ "${TMP_DIR}/" || { echo 'ERROR: Unable to delete deploy directories'; exit 1; }

./build.sh || { echo 'ERROR: Unable to build project'; exit 1; }

mkdir -p "${TMP_DIR}/${DEPLOY_TAG_DIR}/" || { echo 'ERROR: Unable to create deploy directory'; exit 1; }
rsync -a --exclude='.git' . "${TMP_DIR}/${DEPLOY_TAG_DIR}/" || { echo 'ERROR: Unable to copy files for deploy'; exit 1; }

mkdir -p "${DEPLOY_DIR}/" || { echo 'ERROR: Unable to create deploy directory'; exit 1; }
tar -c -z -f "${DEPLOY_DIR}/${DEPLOY_TAG}.tar.gz" -C "${TMP_DIR}/${DEPLOY_DIR}" "${DEPLOY_TAG}" || { echo 'ERROR: Unable to create deploy artifact'; exit 1; }

rm -rf "${TMP_DIR}/"
