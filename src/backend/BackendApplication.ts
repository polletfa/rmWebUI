/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as fs from "fs";

import { ConfigHelper } from "./ConfigHelper";
import { FrontendProvider } from "./FrontendProvider";
import { Server } from "./Server";

/**
 * Main class of the backend application
 */
export class BackendApplication {
    /**
     * Log function
     *
     * @param msg Message to log. A prefix with the time will be added.
     */
    public log(msg: string) {
        const logprefix = (new Date()).toISOString()+ "   ";
        console.log(logprefix + msg.split("\n").join("\n"+logprefix));
    }
    
    /**
     * Start backend application
     */
    constructor() {
        try {
            // switch to the package root directory
            process.chdir(__dirname + "/..");
            
            // load metadata and print name and version
            const package_json = JSON.parse(fs.readFileSync("package.json").toString());
            this.log(package_json.displayName + " " + package_json.version);
            this.log("---");

            // Load frontend files
            FrontendProvider.loadFrontendFiles(this);
            this.log("---");

            // Read configuration
            const config = ConfigHelper.load(this);
            const plural = config.length > 1 ? "s" : "";
            this.log("Starting server"+plural+" on port"+plural+": "+config.map(server => server.port).join(", "));
            this.log("---");

            // Start servers
            for(const server of config) {
                // Initialize and launch HTTP/HTTPS server
                new Server(this, server).run();
            }
            this.log("---");
        } catch(e) {
            this.log("");
            this.log("FATAL: Unable to launch the backend.");
            this.log(e instanceof Error ? ("FATAL: " + e.message) : "");
            process.exit(1);
        }
    }
}
