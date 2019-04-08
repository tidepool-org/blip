#!/bin/sh -e

wget -q -O artifact_node.sh 'https://raw.githubusercontent.com/mdblp/tools/dblp/artifact/artifact_node.sh'
chmod +x artifact_node.sh

wget -q -O artifact_images.sh 'https://raw.githubusercontent.com/mdblp/tools/dblp/artifact/artifact_images.sh'
chmod +x artifact_images.sh

. ./version.sh
./artifact_images.sh
./artifact_node.sh
