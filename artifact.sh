#!/bin/sh -e

wget -q -O artifact_docker.sh 'https://raw.githubusercontent.com/tidepool-org/tools/master/artifact/artifact.sh'
chmod +x artifact_docker.sh

./artifact_docker.sh docker
