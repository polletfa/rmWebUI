/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as fs from "fs";

import { Constants } from "./Constants";
import { ServerConfig, FrontendConfig } from "./Config";
import { ConfigLoader } from "./ConfigLoader";
import { HTTPServer } from "./HTTPServer";

interface FrontendData {
    hasMarker: boolean;
    before: string;
    after: string;
    favicon: string;
}

export class Backend {
    readonly frontend: FrontendData;  /**< Frontend data (main page and favicon) */
    readonly servers: ServerConfig[]; /**< List of server configurations */
    
    constructor() {
        const package_json = JSON.parse(fs.readFileSync("package.json").toString());
        this.log(package_json.displayName + " " + package_json.version);
        this.log("---");
        
        this.frontend = this.loadFrontend();
        this.servers = ConfigLoader.load(this);
        this.log("---");
    }

    public log(msg: string) {
        const logprefix = (new Date()).toISOString()+ "   ";
        console.log(logprefix + msg.split("\n").join("\n"+logprefix));
    }

    protected loadFrontend(): FrontendData {
        this.log("Load frontend main file: "+Constants.FRONTEND_HTML);
        const frontend = fs.readFileSync(Constants.FRONTEND_HTML, "utf8");

        this.log("Load frontend favicon: "+Constants.FRONTEND_FAVICON);
        const favicon = fs.readFileSync(Constants.FRONTEND_FAVICON, "utf8");
        
        const frontendMarker = frontend.lastIndexOf(Constants.FRONTEND_MARKER);
        const hasMarker = frontendMarker >= 0;
        return {
            hasMarker: hasMarker,
            before:    hasMarker ? frontend.substr(0, frontendMarker)                               : frontend,
            after:     hasMarker ? frontend.substr(frontendMarker+Constants.FRONTEND_MARKER.length) : "",
            favicon:   favicon
        };
    }
    
    public getFrontend(config: ServerConfig): string {
        if(this.frontend.hasMarker) {
            return this.frontend.before + JSON.stringify(this.getFrontendConfig(config)) + this.frontend.after;
        } else {
            return this.frontend.before;
        }
    }

    public getFavicon(): string { return this.frontend.favicon; }

    public getFrontendConfig(config: ServerConfig): FrontendConfig {
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
        const plural = this.servers.length > 1 ? "s" : "";
        this.log("Starting server"+plural+" on port"+plural+": "+this.servers.map(server => server.port).join(", "));

        for(const server of this.servers) {
            // Initialize and launch HTTP/HTTPS server
            new HTTPServer(this, server).run();
        }
        this.log("---");
    }

}
