<!-- -------------------------------------------------

   rmWebUI - Web interface for the reMarkable(R) cloud.

   (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
   MIT License (see LICENSE file)
  
--------------------------------------------------- --><?php

require_once __DIR__ . "/config/config.php";
use digitalis\rmWebUI\Config;

if(Config::MODE === "debug") {
  ini_set('display_errors', '1');
  ini_set('display_startup_errors', '1');
  error_reporting(E_ALL);
}

?><!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
  <head>
    <title><?php echo Config::NAME." ".Config::VERSION ?></title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link id="favicon" rel="icon" type="image/svg+xml" href="frontend/resources/cloud.svg">
    <style><?php require __DIR__ . "/frontend/resources/bootstrap.min.css" ?></style>
  </head><body>
    <div class="container-fluid">
      <!-- debug banner -->
      <?php if(Config::MODE === "debug") { ?>
      <div class="row bg-warning"><div class="col text-center">Debug mode</div></div>
      <?php } ?>

      <!-- title -->
      <div class="row">
        <div class="col">
          <span class="h1" id="title-text"><?php echo Config::NAME." ".Config::VERSION ?></span>&nbsp;&nbsp;
          <span id="loading-spinner" class="spinner-border" role="status"></span>
        </div>
        <div id="refresh-button" class="col col-sm-1 d-flex align-items-center justify-content-end d-none">
          <a href="#" onclick="app.getFiles();"><?php require __DIR__ . "/frontend/resources/refresh.svg" ?></a>
        </div>
      </div>

      <!-- error banner -->
      <div id="error-banner" class="alert alert-danger d-none" role="alert">
        <span id="error-text"></span>&nbsp;<a href="#" data-bs-toggle="collapse" data-bs-target="#extended-error">(Details)</a>
        <div class="collapse" id="extended-error"><br/><span id="extended-error-text"></span></div>
      </div>

      <!-- content -->
      <div id="content-register" class="d-none"><?php require __DIR__ . "/frontend/pages/register.php" ?></div>
      <div id="content-list" class="d-none"><?php require __DIR__ . "/frontend/pages/list.php" ?></div>

      <!-- footer -->
      <div class="row bg-dark fixed-bottom text-white">
        <div class="col text-end"><?php echo Config::NAME." ".Config::VERSION ?></div>
      </div>
    </div>
    <!-- Icons -->
    <div class="d-none">
      <div id="icon-empty"><?php require_once __DIR__ . "/frontend/resources/empty.svg" ?></div>
      <div id="icon-file"><?php require_once __DIR__ . "/frontend/resources/file.svg" ?></div>
      <div id="icon-folder"><?php require_once __DIR__ . "/frontend/resources/folder.svg" ?></div>
      <div id="icon-download"><?php require_once __DIR__ . "/frontend/resources/download.svg" ?></div>
    </div>
    <!-- Load Javascript and init interface -->
    <script><?php require __DIR__ . "/frontend/resources/bootstrap.min.js" ?></script>
    <script><?php require __DIR__ . "/frontend/rmWebUI.js" ?></script>
    <script>
      const app = new rmWebUI(<?php Config::toJSON() ?>);
      app.init(<?php require __DIR__ . "/backend/api/files.php" ?>);
    </script>
  </body>
</html>
