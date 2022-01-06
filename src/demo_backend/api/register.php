<?php
$config = json_decode(file_get_contents(__DIR__ . "/../../data/config.json"));

if($config->mode == "debug") {
  ini_set('display_errors', '1');
  ini_set('display_startup_errors', '1');
  error_reporting(E_ALL);
}

$code = isset($_GET["code"]) ? $_GET["code"] : false;
sleep(2);
if($code !== "abcdefgh") {
    echo json_encode(array("status" => "error",
                           "errorType" => "invalid parameters",
                           "error" => "This is a demo version. Use the code 'abcdefgh'."));
} else {
    session_start();
    $_SESSION["registered"] = true;
    
    echo json_encode(array("status" => "success"));
}
?>
