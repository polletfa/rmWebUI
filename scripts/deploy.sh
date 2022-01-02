#!/usr/bin/env bash
# ---------------------------------------------------
#
# rmWebUI - Web interface for the reMarkable(R) cloud.
#
# (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
# MIT License (see LICENSE file)
#
# ---------------------------------------------------

[ -d dist ] && rm -fr dist

# Directories
install -m 0755 -d \
        dist/config \
        dist/backend/cache \
        dist/backend/api \
        dist/frontend/pages \
        dist/frontend/resources

# General files
install -m 0644 LICENSE                              dist/

# Configuration
install -m 0644 config/config.php                    dist/config/

# Backend
install -m 0644 backend/api/files.php                dist/backend/api/
install -m 0644 backend/api/download.php             dist/backend/api/
install -m 0644 backend/api/register.php             dist/backend/api/
install -m 0644 backend/Cache.php                    dist/backend/
install -m 0644 backend/CloudAPI.php                 dist/backend/
install -m 0644 backend/Download.php                 dist/backend/
install -m 0644 backend/Token.php                    dist/backend/

# Frontend
install -m 0644 index.php                            dist/
install -m 0644 frontend/rmWebUI.js                  dist/frontend
install -m 0644 frontend/pages/register.php          dist/frontend/pages/
install -m 0644 frontend/pages/register.js           dist/frontend/pages/
install -m 0644 frontend/pages/list.php              dist/frontend/pages/
install -m 0644 frontend/pages/list.js               dist/frontend/pages/
install -m 0644 frontend/resources/bootstrap.min.css dist/frontend/resources/
install -m 0644 frontend/resources/bootstrap.min.js  dist/frontend/resources/
install -m 0644 frontend/resources/cloud.svg         dist/frontend/resources/
install -m 0644 frontend/resources/download.svg      dist/frontend/resources/
install -m 0644 frontend/resources/empty.svg         dist/frontend/resources/
install -m 0644 frontend/resources/file.svg          dist/frontend/resources/
install -m 0644 frontend/resources/folder.svg        dist/frontend/resources/
install -m 0644 frontend/resources/refresh.svg       dist/frontend/resources/

# Install PHP dependencies
install composer.json dist/
(
    cd dist/
    composer install
    rm composer.json composer.lock
)
