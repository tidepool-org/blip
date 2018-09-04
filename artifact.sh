#!/bin/sh -e

wget -q -O artifact_node.sh 'https://raw.githubusercontent.com/mdblp/tools/dbl/artifact/artifact_node.sh'
chmod +x artifact_node.sh

. ./version.sh
./artifact_node.sh
