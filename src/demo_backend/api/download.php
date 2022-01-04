<?php
$config = json_decode(file_get_contents(__DIR__ . "/../../data/config.json"));

if($config->mode == "debug") {
  ini_set('display_errors', '1');
  ini_set('display_startup_errors', '1');
  error_reporting(E_ALL);
}

session_start();
if(isset($_SESSION["registered"])) {
    $id = isset($_GET["id"]) ? $_GET["id"] : false;
    $version = isset($_GET["version"]) ? $_GET["version"] : false;
    $format = isset($_GET["format"]) ? $_GET["format"] : false;

    if($id === false || $version === false || ($format !== "zip" && $format !== "pdf")) {
        echo json_encode(array("status" => "error",
                               "errorType" => "invalid-parameters",
                               "error" => "Missing parameters"));
    } else {
        sleep(2);
        if($id[0] >= '0' && $id[0] <= '4') {
            echo file_get_contents(__DIR__ . "/../../data/sample_pdf." . $format);
        } else if($id[0] >= '5' && $id[0] <= '9') {
            echo file_get_contents(__DIR__ . "/../../data/sample_notebook." . $format);
        } else {
            echo json_encode(array("status" => "error",
                                   "errorType" => "download-file",
                                   "error" => "This is a example of an error while downloading a file."));
        }
    }
} else {
    echo json_encode(array("status" => "error",
                           "errorType" => "load-token",
                           "error" => "This is a demo version. Register with the code 'abcdefgh'."));
}
?>
