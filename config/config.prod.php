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
     * Specify the mode: debug or prod.
     *
     * In debug mode, additional messages are displayed
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
}
?>
