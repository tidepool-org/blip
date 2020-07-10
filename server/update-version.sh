#!/bin/sh

SERVER_DIR="$(dirname $0)"
SRC_PKG="${SERVER_DIR}/../package.json"
DEST_PKG="${SERVER_DIR}/package.json"

if [ -f "${SRC_PKG}" -a -f "${DEST_PKG}" ]; then
  VERSION="$(grep -E '\s+"version":\s*"([^"]+)",' ${SRC_PKG} | sed -E 's/\s+"version":\s*"([^"]+)",/\1/')"
  echo "Updating version to ${VERSION}"
  sed -i -E "s/\s+\"version\":\s*\"([^\"]+)\",/  \"version\": \"${VERSION}\",/" "${DEST_PKG}"
else
  echo 'package.json(s) not found'
fi
