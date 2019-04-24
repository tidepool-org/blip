#!/bin/sh -e

wget -q -O artifact_none.sh 'https://raw.githubusercontent.com/tidepool-org/tools/ci-changes/artifact/artifact.sh'
chmod +x artifact_none.sh

./artifact_none.sh
