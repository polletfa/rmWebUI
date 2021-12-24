<?php
/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE file)
 *
 *****************************************************/

/**
 * Specify the mode: debug or prod.
 *
 * In debug mode, additional messages are displayed
 */
$mode = "prod";

/**
 * Command to run rmrl (used to convert the files to PDF).
 * To use this feature, you need to install rmrl (https://github.com/rschroll/rmrl)
 *
 * If you leave this parameter empty, files will be downloaded as a ZIP file containing
 * metadata and the lines file.
 */
$rmrl = "python3 -m rmrl ";
?>
