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
mkdir dist
cp -r composer.json LICENSE index.php class css svg config dist
cd dist
mkdir cache
if [ "$1" != "prod" ]; then
    mv config/config.debug.php config/config.php
    rm config/config.prod.php
else
    mv config/config.prod.php config/config.php
    rm config/config.debug.php
fi
composer install
rm composer.json composer.lock
