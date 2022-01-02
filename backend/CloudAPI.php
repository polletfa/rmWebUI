<?php
/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE file)
 *
 *****************************************************/

namespace digitalis\rmWebUI;

require_once __DIR__ . "/../vendor/autoload.php";
require_once __DIR__ . "/Token.php";
require_once __DIR__ . "/Download.php";
require_once __DIR__ . "/Cache.php";

use splitbrain\RemarkableAPI\RemarkableAPI;
use splitbrain\RemarkableAPI\RemarkableFS;

// use exceptions for php errors
function exception_error_handler($severity, $message, $file, $line) {
    throw new \ErrorException($message, 0, $severity, $file, $line);
}
set_error_handler("digitalis\\rmWebUI\\exception_error_handler");

/**
 * Class for CloudAPI requests
 */
class CloudAPI {
    /**
     * List of supported formats
     *
     * @returns List of supported formats
     */
    static function getFormats() {
        if(is_string(Config::RMRL) && trim(Config::RMRL) != "") {
            return ["pdf", "zip"];
        } else {
            return ["zip"];
        }
    }
    /**
     * Write a JSON response
     *
     * @param msg Message to write
     */
    static function writeResponse($msg) {
        echo json_encode($msg);
    }

    /**
     * Connect to the cloud: load token & init API
     *
     * Will send a JSON error response on failure:
     * {
     *   status: "error",
     *   errorType: "load-token"|"init-api",
     *   error: string
     * }
     *
     * @return API object or false
     */
    static function connect() {
        // load-token
        $token = false;
        try {
            $token = Token::get();
        } catch(\Exception $e) {
            self::writeResponse(array("status" => "error",
                                     "errorType" => "load-token",
                                     "error" => $e->getMessage()));
            return false;
        }
        // init-api
        $api = new RemarkableAPI(null);
        try {
            $api->init($token);
        } catch(\Exception $e) {
            self::writeResponse(array("status" => "error",
                                     "errorType" => "init-api",
                                     "error" => $e->getMessage()));
            return false;
        }
        return $api;
    }

    /**
     * Check that all parameters are provided
     *
     * Will send a JSON error response on failure:
     * {
     *   status: "error",
     *   errorType: "invalid-parameters",
     *   error: string
     * }
     *
     * @param params List of parameters as an associative array
     * @return True/False
     */
    static function checkParameters($params) {
        $missing = array();
        foreach($params as $key => $value) {
            if($value === false) {
                array_push($missing, $key);
            }
        }
        if(count($missing) > 0) {
            self::writeResponse(array("status" => "error",
                                      "errorType" => "invalid-parameters",
                                      "error" => "Missing parameter(s): " . implode(", ", $missing)));
            return false;
        }
        return true;
    }

    /**
     * API method: register
     *
     * Response:
     * {
     *   status: "success"|"error",
     *   errorType?: "invalid-parameters"|"register", // on status=="error"
     *   error?: string                               // on status=="error"
     * }
     *
     * @param code One-time registration code
     * @return Success (true/false)
     */
    static function register($code) {
        if(!self::checkParameters(array("code" => $code))) {
            return false;
        }
        try {
            $api = new RemarkableAPI(null);
            Token::set($api->register($code));
        } catch(\Exception $e) {
            self::writeResponse(array("status" => "error",
                                     "errorType" => "register",
                                     "error" => $e->getMessage()));
            return false;
        }
        self::writeResponse(array("status" => "success"));
        return true;
    }

    /**
     * API method: download
     *
     * Response:
     * {
     *   status: "error",
     *   errorType: "invalid-parameters"|"load-token"|"init-api"|"download-file"|"convert-file",
     *   error: string
     * }
     * or binary data
     *
     * @param id Document ID
     * @param version Document version
     * @param format zip or pdf
     * @return Success (true/false)
     */
    static function download($id, $version, $format) {
        if(!self::checkParameters(array("id" => $id, "version" => $version, "format" => $format)))  {
            return false;
        }
        if(!in_array($format, self::getFormats())) {
            self::writeResponse(array("status" => "error",
                                      "errorType" => "invalid-parameters",
                                      "error" => "unknown/unsupported format: ".$format));
            return false;
        }

        // connect
        $api = self::connect();
        if($api === false)
            return false;

        // download file
        $res = Download::getFile($api, $id, $version, $format);
        if(is_string($res)) {
            echo $res;
            return true;
        }
        self::writeResponse($res);
        return false;
    }

    /**
     * API method: files
     *
     * Response:
     * {
     *   status: "success"|"error",
     *   errorType?: "load-token"|"init-api"|"retrieve-files", // on status=="error"
     *   error?: string,                                       // on status=="error"
     *   files?: Array<{                                       // on status=="success"
     *     ID: string,
     *     Version: string,
     *     Type: string,
     *     Name: string,
     *     Path: string,
     *     Parent: string
     *   }>
     * }
     *
     * @return Success (true/false)
     */
    static function files() {
        $api = self::connect();
        if($api === false)
            return false;

        // retrieve-files
        $files = array();
        try {
            $fs = new RemarkableFS($api);
            foreach($fs->getTree() as $path => $items) {
                foreach($items as $item) {
                    array_push($files, array("ID" => $item["ID"],
                                             "Version" => $item["Version"],
                                             "Type" => $item["Type"],
                                             "Name" => $item["VissibleName"],
                                             "Path" => $path,
                                             "Parent" => $item["Parent"]));
                }
            }
        } catch(\Exception $e) {
            self::writeResponse(array("status" => "error",
                                      "errorType" => "retrieve-files",
                                      "error" => $e->getMessage()));
            return false;
        }
        self::writeResponse(array("status" => "success",
                                  "files" => $files));
        // cleanup cache
        try {
            Cache::cleanupCache($files);
        } catch(\Exception $e) {}
        return true;
    }
 }
