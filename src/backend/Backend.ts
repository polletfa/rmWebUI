/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as http from "http";
import * as https from "https";
import * as fs from "fs";

import { Constants } from "./Constants";
import { Config, FrontendConfig } from "./Config";
import { ConfigManager } from "./ConfigManager";
import { HTTPServer } from "./HTTPServer";

export class Backend {
    readonly NAME: string;
    readonly VERSION: string;
    
    readonly configManager: ConfigManager;
    
    readonly frontendHasMarker;
    readonly frontendBeforeMarker;
    readonly frontendAfterMarker;
    readonly favicon;

    constructor() {
        this.configManager = new ConfigManager(this);

        const package_json = JSON.parse(fs.readFileSync("package.json").toString());
        this.NAME = package_json.displayName;
        this.VERSION = package_json.version;

        // load frontend
        const frontend = fs.readFileSync(Constants.FRONTEND_HTML, "utf8");
        const frontendMarker = frontend.lastIndexOf(Constants.FRONTEND_MARKER);
        if(frontendMarker >= 0) {
            this.frontendHasMarker = true;
            this.frontendBeforeMarker = frontend.substr(0, frontendMarker);
            this.frontendAfterMarker = frontend.substr(frontendMarker+Constants.FRONTEND_MARKER.length);
        } else {
            this.frontendHasMarker = false;
            this.frontendBeforeMarker = frontend;
            this.frontendAfterMarker = "";
        }
        this.favicon = fs.readFileSync(Constants.FRONTEND_FAVICON, "utf8");
    }

    public getFrontend(config: Config): string {
        if(this.frontendHasMarker) {
            return this.frontendBeforeMarker + JSON.stringify(this.getFrontendConfig(config)) + this.frontendAfterMarker;
        } else {
            return this.frontendBeforeMarker;
        }
    }

    public getFavicon(): string { return this.favicon; }

    public getFrontendConfig(config: Config): FrontendConfig {
        return {
            demo: config.demo,
            formats: config.pdfconverter.trim().length == 0 ? [ "zip", "pdf" ] : [ "zip" ],
            register: config.register
        };
    }

    /**
     * Start
     */
    public run(): void {
        // Show config
        console.log(this.NAME+" "+this.VERSION);
        console.log(JSON.stringify(this.configManager.config, null, 2));

        // Initialize and launch HTTP/HTTPS server
        new HTTPServer(this, this.configManager.config).run();
    }

}
