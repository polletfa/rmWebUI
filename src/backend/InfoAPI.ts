/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE file)
 *
 *****************************************************/

import * as http from "http";
import * as fs from "fs";

import { Backend } from "./Backend";
import { APIBase } from "./APIBase";

export class InfoAPI extends APIBase {
    readonly NAME: string;
    readonly VERSION: string;
    readonly DEMO: boolean;
    
    constructor(backend: Backend) {
        super(backend);

        // don't catch exception - we want to fail on start if package.json is corrupted
        const package_json = JSON.parse(fs.readFileSync("package.json").toString());
        this.NAME = package_json.displayName;
        this.VERSION = package_json.version;
        this.DEMO = true;
    }

    public version(response: http.ServerResponse): void {
        this.sendAPIResponseSuccess({name: this.NAME, version: this.VERSION, demo: this.DEMO}, response);
    }
    
}
