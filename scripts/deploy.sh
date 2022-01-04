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
if [ "$1" = "demo" ]; then
    INSTALL="$PACKAGE_ROOT/demo"
else
    INSTALL="$PACKAGE_ROOT/dist"
fi

# Extract name and version from composer.json
if [ "$1" = "demo" ]; then
    jq '{name:.displayName,version:.version,demo:true}' "$PACKAGE_ROOT/composer.json" > /tmp/version.json
else
    jq '{name:.displayName,version:.version,demo:false}' "$PACKAGE_ROOT/composer.json" > /tmp/version.json
fi

# Directories
[ -d "$INSTALL" ] && rm -fr "$INSTALL"
install -m 0755 -d \
        "$INSTALL"/data \
        "$INSTALL"/backend \
        "$INSTALL"/backend/api \
        "$INSTALL"/frontend/pages \
        "$INSTALL"/frontend/resources

# General files
install -m 0644 README.md                                      "$INSTALL"/
install -m 0644 CHANGELOG.md                                   "$INSTALL"/
install -m 0644 LICENSE.md                                     "$INSTALL"/
install -m 0644 /tmp/version.json                              "$INSTALL"/

# Configuration
install -m 0644 src/data/config.json                           "$INSTALL"/data/

# Backend
if [ "$1" = "demo" ]; then
    install -m 0644 src/demo_backend/api/files.php             "$INSTALL"/backend/api/
    install -m 0644 src/demo_backend/api/download.php          "$INSTALL"/backend/api/
    install -m 0644 src/demo_backend/api/register.php          "$INSTALL"/backend/api/
    install -m 0644 src/demo_backend/data/files.json           "$INSTALL"/data/
    install -m 0644 src/demo_backend/data/sample_notebook.pdf  "$INSTALL"/data/
    install -m 0644 src/demo_backend/data/sample_notebook.zip  "$INSTALL"/data/
    install -m 0644 src/demo_backend/data/sample_pdf.pdf       "$INSTALL"/data/
    install -m 0644 src/demo_backend/data/sample_pdf.zip       "$INSTALL"/data/   
else
    install -m 0644 src/backend/api/files.php                  "$INSTALL"/backend/api/
    install -m 0644 src/backend/api/download.php               "$INSTALL"/backend/api/
    install -m 0644 src/backend/api/register.php               "$INSTALL"/backend/api/
    install -m 0644 src/backend/Cache.php                      "$INSTALL"/backend/
    install -m 0644 src/backend/CloudAPI.php                   "$INSTALL"/backend/
    install -m 0644 src/backend/Download.php                   "$INSTALL"/backend/
    install -m 0644 src/backend/Token.php                      "$INSTALL"/backend/
fi

# Frontend
install -m 0644 src/index.html                                 "$INSTALL"/
install -m 0644 src/frontend/index.html                        "$INSTALL"/frontend/
install -m 0644 src/frontend/rmWebUI.js                        "$INSTALL"/frontend/
install -m 0644 src/frontend/pages/register.html               "$INSTALL"/frontend/pages/
install -m 0644 src/frontend/pages/register.js                 "$INSTALL"/frontend/pages/
install -m 0644 src/frontend/pages/list.html                   "$INSTALL"/frontend/pages/
install -m 0644 src/frontend/pages/list.js                     "$INSTALL"/frontend/pages/
install -m 0644 src/frontend/resources/bootstrap.min.css       "$INSTALL"/frontend/resources/
install -m 0644 src/frontend/resources/bootstrap.min.js        "$INSTALL"/frontend/resources/
install -m 0644 src/frontend/resources/cloud.svg               "$INSTALL"/frontend/resources/
install -m 0644 src/frontend/resources/download.svg            "$INSTALL"/frontend/resources/
install -m 0644 src/frontend/resources/empty.svg               "$INSTALL"/frontend/resources/
install -m 0644 src/frontend/resources/file.svg                "$INSTALL"/frontend/resources/
install -m 0644 src/frontend/resources/folder.svg              "$INSTALL"/frontend/resources/
install -m 0644 src/frontend/resources/refresh.svg             "$INSTALL"/frontend/resources/

# Install PHP dependencies
install composer.json "$INSTALL"/
(
    cd "$INSTALL"/
    composer install
    rm composer.json composer.lock
)
