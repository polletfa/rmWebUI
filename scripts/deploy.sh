#!/usr/bin/env bash
[ -d dist ] && rm -fr dist
mkdir dist
cp -r composer.json index.php class css svg config dist
cd dist
if [ "$1" != "prod" ]; then
    mv config/config.debug.php config/config.php
    rm config/config.prod.php
else
    mv config/config.prod.php config/config.php
    rm config/config.debug.php
fi
composer install
rm composer.json composer.lock
