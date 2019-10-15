#!/bin/sh -e
wget -q -O artifact_node.sh 'https://raw.githubusercontent.com/mdblp/tools/dblp/artifact/artifact_node.sh'
wget -q -O artifact_images.sh 'https://raw.githubusercontent.com/mdblp/tools/dblp/artifact/artifact_images.sh'

. ./version.sh
bash -eu artifact_images.sh
bash -eu artifact_node.sh
