#!/bin/bash -eux
#
# This code is meant to be executed within a TravisCI build.

publish_to_dockerhub() {
    if [ -n "${DOCKER_USERNAME:-}" ] && [ -n "${DOCKER_PASSWORD:-}"  ]; then
        DOCKER_REPO="tidepool/${TRAVIS_REPO_SLUG#*/}"
        echo "${DOCKER_PASSWORD}" | docker login --username "${DOCKER_USERNAME}" --password-stdin

        if [ "${TRAVIS_REPO_SLUG:-}" == "tidepool-org/blip" ]; then
            RX_ENABLED=${RX_ENABLED-false}
            if [[ ",${RX_ENABLED_BRANCHES:-}," = *",${TRAVIS_PULL_REQUEST_BRANCH:-$TRAVIS_BRANCH},"* ]]; then RX_ENABLED=true; fi
            docker build --tag "${DOCKER_REPO}" --build-arg ROLLBAR_POST_SERVER_TOKEN="${ROLLBAR_POST_SERVER_TOKEN:-}" --build-arg LAUNCHDARKLY_CLIENT_TOKEN="${LAUNCHDARKLY_CLIENT_TOKEN:-}" --build-arg REACT_APP_GAID="${REACT_APP_GAID:-}" --build-arg RX_ENABLED="${RX_ENABLED:-}" --build-arg TRAVIS_COMMIT="${TRAVIS_COMMIT:-}" .
        else
            docker build --tag "${DOCKER_REPO}" .
        fi

        if [ "${TRAVIS_BRANCH:-}" == "master" ] && [ "${TRAVIS_PULL_REQUEST_BRANCH:-}" == "" ]; then
            docker push "${DOCKER_REPO}"
        fi
        if [ -n "${TRAVIS_TAG:-}" ]; then
            docker tag "${DOCKER_REPO}" "${DOCKER_REPO}:${TRAVIS_TAG}"
            docker push "${DOCKER_REPO}:${TRAVIS_TAG}"
        fi
        if [ -n "${TRAVIS_BRANCH:-}" ] && [ -n "${TRAVIS_COMMIT:-}"  ]; then
            if [ -n "${TRAVIS_PULL_REQUEST_BRANCH}" ]
            then
                BRANCH=$(echo -n ${TRAVIS_PULL_REQUEST_BRANCH} | tr / -)
            else
                BRANCH=$(echo -n ${TRAVIS_BRANCH} | tr / -)
            fi
            docker tag "${DOCKER_REPO}" "${DOCKER_REPO}:${BRANCH}-${TRAVIS_COMMIT}"
            docker push "${DOCKER_REPO}:${BRANCH}-${TRAVIS_COMMIT}"

            TIMESTAMP=$(date +%s)
            docker tag "${DOCKER_REPO}" "${DOCKER_REPO}:${BRANCH}-${TRAVIS_COMMIT}-${TIMESTAMP}"
            docker push "${DOCKER_REPO}:${BRANCH}-${TRAVIS_COMMIT}-${TIMESTAMP}"

            docker tag "${DOCKER_REPO}" "${DOCKER_REPO}:${BRANCH}-latest"
            docker push "${DOCKER_REPO}:${BRANCH}-latest"
        fi
    else
        echo "Missing DOCKER_USERNAME or DOCKER_PASSWORD."
    fi
}

publish_to_dockerhub
