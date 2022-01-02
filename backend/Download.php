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
require_once __DIR__ . "/../config/config.php";
require_once __DIR__ . "/Cache.php";

use splitbrain\RemarkableAPI\RemarkableFS;

/**
 * Class for retrieving files (cache or download)
 */
class Download {
    /**
     * Retrieve a file
     *
     * @param api remarkableAPI
     * @param id Item ID
     * @param version Item version (the version may be updated)
     * @param format pdf or zip
     * @return binary data or array of {
     *           status: "error", 
     *           errorType?: "invalid-parameters"|"download-file"|"convert-file",
     *           error?: string
     *         }
     */
    static function getFile($api, $id, &$version, $format) {
        if($format == "pdf" && is_string(Config::RMRL) && trim(Config::RMRL) != "") {
            $res = self::getPDF($api, $id, $version);
        } else if($format == "zip") {
            $res = self::getZIP($api, $id, $version);
        } else {
            $res = array("status" => "error",
                         "errorType" => "invalid-parameters",
                         "error" => "unknown/unsupported format: ".$format);
        }
        return $res;
    }

    /**
     * Retrieve a PDF file
     *
     * @param api remarkableAPI
     * @param id Item ID
     * @param version Item version (the version may be updated)
     * @return Same format as getFile
     * @see getFile
     */
    static function getPDF($api, $id, &$version) {
        if(Config::CACHE == true) {
            // Search for file in cache
            try {
                $cachedfile = Cache::getCachedFile($id, $version, "pdf");
                if($cachedfile != null) {
                    return $cachedfile;
                }
            } catch(\Exception $e) {}
        }

        // PDF not in cache - Get ZIP
        $zip = self::getZIP($api, $id, $version);
        if(!is_string($zip)) return $zip;

        // Convert ZIP to PDF
        $pdf = self::convertToPDF($id, $version, $zip);

        if(is_string($pdf) && Config::CACHE == true) {
            // Save in cache
            try {
                Cache::cacheFile($id, $version, "pdf", $pdf);
            } catch(\Exception $e) {}
        }

        return $pdf;
    }

    /**
     * Retrieve a ZIP file
     *
     * @param api remarkableAPI
     * @param id Item ID
     * @param version Item version (the version may be updated)
     * @return Same format as getFile
     * @see getFile
     */
    static function getZIP($api, $id, &$version) {
        if(Config::CACHE == true) {
            // Search for file in cache
            $cachedfile = Cache::getCachedFile($id, $version, "zip");
            if($cachedfile != null) {
                return $cachedfile;
            }
        }

        // ZIP not in cache - download
        $filecontent = null;
        try {
            $filecontent = strval($api->downloadDocument($id)->getBody());                
        } catch(\Exception $e) {
            return array("status" => "error",
                         "errorType" => "download-file",
                         "error" => $e->getMessage());
        }

        if(Config::CACHE == true) {
            // Save in cache
            try {
                // retrieve file list and check version (which may have changed)
                $fs = new RemarkableFS($api);
                foreach($fs->getTree() as $path => $items) {
                    foreach($items as $item) {
                        if($item["ID"] == $id) {
                            $version = $item["Version"];
                            goto break_double_foreach;
                        }
                    }
                }
                break_double_foreach:

                Cache::cacheFile($id, $version, "zip", $filecontent);
            } catch(\Exception $e) {}
        }

        return $filecontent;
    }

    /**
     * Convert to PDF
     * 
     * @param id Item ID
     * @param version Item version
     * @param zip Content of the zip file
     * @return Same format as getFile
     * @see getFile
     */
    static function convertToPDF($id, $version, $zip) {
        try {
            $tmpfile = "/tmp/".$id.".".$version.".zip";
            file_put_contents($tmpfile, $zip);
            $resultcode = null;
            $output = null;
            exec(Config::RMRL." ".$tmpfile . " 2>/".$tmpfile.".log", $output, $resultcode);
            unlink($tmpfile);
            
            if($resultcode !== 0) {
                $res = array("status" => "error",
                             "errorType" => "convert-file",
                             "error" => file_get_contents($tmpfile.".log"));
            } else {
                $res = implode("\n", $output);
            }
            unlink($tmpfile.".log");
            return $res;
        } catch(\Exception $e) {
            return array("status" => "error",
                         "errorType" => "convert-file",
                         "error" => $e->getMessage());             
        }

    }
}
