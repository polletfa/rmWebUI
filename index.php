<?php

// Read configuration and set mode (debug or prod)
require_once __DIR__ . '/config/config.php';

if($mode == "debug") {
    ini_set('display_errors', '1');
    ini_set('display_startup_errors', '1');
    error_reporting(E_ALL);
}

// Load dependencies
require_once __DIR__ . '/vendor/autoload.php';

// Load main class
require_once __DIR__ . '/class/rmWebUI.php';
use digitalis\rmWebUI\rmWebUI;

// Run WebUI
$webui = new rmWebUI($mode);
$webui->run();
?>
