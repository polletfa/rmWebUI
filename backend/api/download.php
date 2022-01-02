<?php
require_once __DIR__ . "/../../config/config.php";
use digitalis\rmWebUI\Config;

if(Config::MODE == "debug") {
  ini_set('display_errors', '1');
  ini_set('display_startup_errors', '1');
  error_reporting(E_ALL);
}

require_once __DIR__ . "/../CloudAPI.php";
digitalis\rmWebUI\CloudAPI::download(isset($_GET["id"]) ? $_GET["id"] : false,
                                     isset($_GET["version"]) ? $_GET["version"] : false,
                                     isset($_GET["format"]) ? $_GET["format"] : false);
?>
