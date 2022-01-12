/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import { Backend } from './Backend';

try {
    (new Backend).run();
} catch(e) {
    console.log();
    console.log("FATAL: Unable to launch the backend.");
    console.log(e instanceof Error ? ("FATAL: " + e.message) : "");
    process.exit(1);
}
