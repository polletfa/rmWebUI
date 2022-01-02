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

class Config {
    /**
     * Program name
     */
    const NAME = "rmWebUI";

    /**
     * Version
     */
    const VERSION = "0.4.0";

    /**
     * Mode: "debug" or "prod"
     * Enable/Disable PHP errors
     */
    const MODE = "prod";
    
    /**
     * Set to true to activate cache
     * Make sure the folder cache/ is writeable by the web server
     */
    const CACHE = true;
    
    /**
     * Command to run rmrl (used to convert the files to PDF).
     * To use this feature, you need to install rmrl (https://github.com/rschroll/rmrl)
     *
     * If you leave this parameter empty, files will be downloaded as a ZIP file containing
     * metadata and the lines file.
     */
    const RMRL = "";
    //const RMRL = "python -m rmrl ";
    //const RMRL = "python3 -m rmrl ";
    //const RMRL = "python3.7 -m rmrl ";

    /**
     * Output the config in JSON format
     */
    static function toJSON() {
        echo json_encode(array("name" => Config::NAME,
                               "version" => Config::VERSION,
                               "mode" => Config::MODE,
                               "cache" => Config::CACHE,
                               "rmrl" => Config::RMRL));
    }
}
?>
