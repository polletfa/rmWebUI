/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as http from "http";
import * as fs from "fs";

import { BackendApplication } from "./BackendApplication";
import { Constants } from "./Constants";
import { Server } from "./Server";
import { ServerModule } from "./ServerModule";

import { FrontendConfig } from "./types/Config";

export class FrontendProvider extends ServerModule {
    protected static hasMarker: boolean;
    protected static before: string;
    protected static after: string;
    protected static favicon: string;

    constructor(server: Server) {
        super(server);
    }

    static loadFrontendFiles(backend: BackendApplication): void {
        backend.log("Load frontend main file: "+Constants.FRONTEND_HTML);
        const frontend = fs.readFileSync(Constants.FRONTEND_HTML, "utf8");

        const frontendMarker = frontend.lastIndexOf(Constants.FRONTEND_MARKER);
        FrontendProvider.hasMarker = frontendMarker >= 0;
        FrontendProvider.before = FrontendProvider.hasMarker ? frontend.substr(0, frontendMarker) : frontend;
        FrontendProvider.after = FrontendProvider.hasMarker ? frontend.substr(frontendMarker+Constants.FRONTEND_MARKER.length) : "";

        backend.log("Load frontend favicon: "+Constants.FRONTEND_FAVICON);
        FrontendProvider.favicon = fs.readFileSync(Constants.FRONTEND_FAVICON, "utf8");
    }
    
    protected serveFrontend(statusCode = 200, error = ""): string {
        if(FrontendProvider.hasMarker) {
            return FrontendProvider.before + JSON.stringify(this.getFrontendConfig(statusCode, error)) + FrontendProvider.after;
        } else {
            return FrontendProvider.before;
        }
    }

    protected serveFavicon(): string { return FrontendProvider.favicon; }

    protected getFrontendConfig(statusCode = 200, error = ""): FrontendConfig {
        return {
            statusCode: statusCode,
            error: error,
            insecure: this.server.insecure,
            
            demo: this.server.config.demo,
            formats: this.server.config.demo || this.server.config.pdfconverter.trim().length > 0 ? [ "zip", "pdf" ] : [ "zip" ],
            fakeRegisterCode: this.server.config.fakeRegisterCode
        };
    }

    /**
     * Handle a HTTP request
     *
     * @param url Parsed URL
     * @param response HTTP response object
     * @return True if the request is supported by the module, false otherwise
     */
    public handleRequest(url: URL, _: string, response: http.ServerResponse): boolean {
        switch(url.pathname == "/" ? "/index.html" : url.pathname) {
            case "/index.html":
                this.server.log("Frontend: application");
                response.setHeader("Content-Type", "text/html");
                response.end(this.serveFrontend());
                this.server.log("SUCCESS");
                return true;

            case "/favicon.svg":
                this.server.log("Frontend: favicon");
                response.setHeader("Content-Type", "image/svg+xml");
                response.end(this.serveFavicon());
                this.server.log("SUCCESS");
                return true;

            case "/robots.txt":
                this.server.log("Frontend: robots.txt");
                response.setHeader("Content-Type", "text/plain");
                response.end("User-agent: *\n"  // disallow for all robots
                    +"Disallow: /\n");
                return true;
                
            default:
                return false;
        }
    }

    /**
     * Handle an error.
     *
     * @param statusCode HTTP response code
     * @param error Error message
     * @param response HTTP response object
     * @return True
     */
    public handleError(statusCode: number, error: string, response: http.ServerResponse): boolean {
        response.statusCode = statusCode;
        response.setHeader("Content-Type", "text/html");
        response.end(this.serveFrontend(statusCode, error));
        return true;
    }
}
