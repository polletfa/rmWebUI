/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as fs from "fs";

const toDelete = ["_build", "_dist"];
if(process.argv[2] == "--all") {
    toDelete.push("package-lock.json");
    toDelete.push("node_modules");
}
for(const dir of toDelete)
    if(fs.existsSync(dir))
        fs.rmSync(dir, {recursive: true});
