#!/usr/bin/env bash
mkdir dist
cp -r composer.json index.php class css svg config dist
cd dist
composer install
rm composer.json composer.lock
