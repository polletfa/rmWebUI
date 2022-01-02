<!-- -------------------------------------------------

   rmWebUI - Web interface for the reMarkable(R) cloud.

   (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
   MIT License (see LICENSE file)
  
--------------------------------------------------- --><?php

$config = json_decode(file_get_contents(__DIR__ . "/../config/config.json"));
$version = json_decode(file_get_contents(__DIR__ . "/../config/version.json"));

if($config->mode === "debug") {
  ini_set('display_errors', '1');
  ini_set('display_startup_errors', '1');
  error_reporting(E_ALL);
}

?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
  <head>
    <title><?php echo $version->name."&nbsp;".$version->version ?></title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link id="favicon" rel="icon" type="image/svg+xml" href="resources/cloud.svg">
    <style><?php require __DIR__ . "/resources/bootstrap.min.css" ?></style>
  </head><body>
    <div class="container-fluid">
      <!-- debug banner -->
      <?php if($config->mode === "debug") { ?>
      <div class="row bg-warning"><div class="col text-center">Debug mode</div></div>
      <?php } ?>

      <!-- title -->
      <div class="row">
        <div class="col h1" id="title-text"><?php echo $version->name."&nbsp;".$version->version ?></div>
        <div class="col col-sm-1 d-flex align-items-center justify-content-end">
          <span id="loading-spinner" class="spinner-border" style="width: 24px; height: 24px;" role="status"></span>
          <a id="refresh-button" class="d-none" href="#" onclick="app.getFiles();"><?php require __DIR__ . "/resources/refresh.svg" ?></a>
        </div>
      </div>

      <!-- error banner -->
      <div id="error-banner" class="alert alert-dark d-none" role="alert">
        <span id="error-text"></span>&nbsp;<a class="alert-link" href="#" data-bs-toggle="collapse" data-bs-target="#extended-error">(Details)</a>
        <div class="collapse" id="extended-error"><br/><span id="extended-error-text"></span></div>
      </div>

      <!-- content -->
      <div id="content-register" class="d-none"><?php require __DIR__ . "/pages/register.php" ?></div>
      <div id="content-list" class="d-none"><?php require __DIR__ . "/pages/list.php" ?></div>

      <!-- footer -->
      <div class="row bg-dark fixed-bottom text-white">
        <div class="col text-end"><?php echo $version->name."&nbsp;".$version->version ?></div>
      </div>
    </div>
    <!-- Icons -->
    <div class="d-none">
      <div id="icon-empty"><?php require_once __DIR__ . "/resources/empty.svg" ?></div>
      <div id="icon-file"><?php require_once __DIR__ . "/resources/file.svg" ?></div>
      <div id="icon-folder"><?php require_once __DIR__ . "/resources/folder.svg" ?></div>
      <div id="icon-download"><?php require_once __DIR__ . "/resources/download.svg" ?></div>
    </div>
    <!-- Load Javascript and init interface -->
    <script><?php require __DIR__ . "/resources/bootstrap.min.js" ?></script>
    <script><?php require __DIR__ . "/rmWebUI.js" ?></script>
    <script>
      const version = <?php require __DIR__ . "/../config/version.json"   ?>;
      const config  = <?php require __DIR__ . "/../config/config.json"    ?>;
      const files   = <?php require __DIR__ . "/../backend/api/files.php" ?>;
      
      const app = new rmWebUI(version, config);
      app.init(files);
    </script>
  </body>
</html>
