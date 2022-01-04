<?php
$config = json_decode(file_get_contents(__DIR__ . "/../../data/config.json"));

if($config->mode == "debug") {
  ini_set('display_errors', '1');
  ini_set('display_startup_errors', '1');
  error_reporting(E_ALL);
}

session_start();
if(isset($_SESSION["registered"])) {
    sleep(2);
    echo json_encode(array("status" => "success",
                           "files" => json_decode(file_get_contents(__DIR__ . "/../../data/files.json"))));
} else {
    echo json_encode(array("status" => "error",
                           "errorType" => "load-token",
                           "error" => "This is a demo version. Register with the code 'abcdefgh'."));
}
?>
