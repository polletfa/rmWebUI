#!/usr/bin/env bash
# ---------------------------------------------------
#
# rmWebUI - Web interface for the reMarkable(R) cloud.
#
# (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
# MIT License (see LICENSE file)
#
# ---------------------------------------------------

PACKAGE_ROOT="$(dirname "$(realpath "$0")")/.."
INSTALL="$PACKAGE_ROOT/dist"

# Extract name and version from composer.json
jq '{name:.displayName,version:.version}' "$PACKAGE_ROOT/composer.json" > /tmp/version.json

# Directories
[ -d dist ] && rm -fr dist
install -m 0755 -d \
        dist/data \
        dist/backend \
        dist/backend/api \
        dist/frontend/pages \
        dist/frontend/resources

# General files
install -m 0644 README.md                                dist/
install -m 0644 CHANGELOG.md                             dist/
install -m 0644 LICENSE.md                               dist/
install -m 0644 /tmp/version.json                        dist/

# Configuration
install -m 0644 src/data/config.json                     dist/data/

# Backend
install -m 0644 src/backend/api/files.php                dist/backend/api/
install -m 0644 src/backend/api/download.php             dist/backend/api/
install -m 0644 src/backend/api/register.php             dist/backend/api/
install -m 0644 src/backend/Cache.php                    dist/backend/
install -m 0644 src/backend/CloudAPI.php                 dist/backend/
install -m 0644 src/backend/Download.php                 dist/backend/
install -m 0644 src/backend/Token.php                    dist/backend/

# Frontend
install -m 0644 src/index.html                           dist/
install -m 0644 src/frontend/index.html                  dist/frontend/
install -m 0644 src/frontend/rmWebUI.js                  dist/frontend/
install -m 0644 src/frontend/pages/register.html         dist/frontend/pages/
install -m 0644 src/frontend/pages/register.js           dist/frontend/pages/
install -m 0644 src/frontend/pages/list.html             dist/frontend/pages/
install -m 0644 src/frontend/pages/list.js               dist/frontend/pages/
install -m 0644 src/frontend/resources/bootstrap.min.css dist/frontend/resources/
install -m 0644 src/frontend/resources/bootstrap.min.js  dist/frontend/resources/
install -m 0644 src/frontend/resources/cloud.svg         dist/frontend/resources/
install -m 0644 src/frontend/resources/download.svg      dist/frontend/resources/
install -m 0644 src/frontend/resources/empty.svg         dist/frontend/resources/
install -m 0644 src/frontend/resources/file.svg          dist/frontend/resources/
install -m 0644 src/frontend/resources/folder.svg        dist/frontend/resources/
install -m 0644 src/frontend/resources/refresh.svg       dist/frontend/resources/

# Install PHP dependencies
install composer.json dist/
(
    cd dist/
    composer install
    rm composer.json composer.lock
)
