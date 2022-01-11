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

import { SessionManager } from "./SessionManager";
import { Constants } from "./Constants";
import { Config } from './Config';

import { ICloudAPI } from "./ICloudAPI";
import { FakeCloudAPI } from "./FakeCloudAPI";
import { BackendAPI } from "./BackendAPI";

export class Backend {
    readonly NAME: string;
    readonly VERSION: string;
    readonly DEMO: boolean;
    
    readonly cloudAPI: ICloudAPI;
    readonly backendAPI: BackendAPI;
    readonly sessionManager: SessionManager;
    
    protected protocol = "";
    protected frontendHasMarker: boolean;
    protected frontendBeforeMarker: string;
    protected frontendAfterMarker: string;
    protected favicon: string;

    constructor() {
        this.cloudAPI = new FakeCloudAPI(this);
        this.backendAPI = new BackendAPI(this);
        this.sessionManager = new SessionManager(this);
        
        const package_json = JSON.parse(fs.readFileSync("package.json").toString());
        this.NAME = package_json.displayName;
        this.VERSION = package_json.version;
        this.DEMO = true;

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

    public onHttpError(error: Error): void {
        console.log("HTTP server error: "+error.message);
    }
    
    public onHttpRequest(request: http.IncomingMessage, response: http.ServerResponse) : void {
        try {
            if(request.url) {
                const url = new URL(request.url, this.protocol+"://"+request.headers.host);
                console.log("------------------------------------ " + (new Date()).toISOString());
                console.log(url.href);
                
                switch(url.pathname == "/" ? "/index.html" : url.pathname) {
                    // Cloud API
                    // Access to the reMarkable(R) cloud

                    case "/cloud/register":
                        console.log("Cloud API: register");
                        this.cloudAPI.register(url.searchParams.get("sessionId"),
                                               url.searchParams.get("code"),
                                               response);
                        break;
                        
                    case "/cloud/files":
                        console.log("Cloud API: files");
                        this.cloudAPI.files(url.searchParams.get("sessionId"),
                                            response);
                        break;
                        
                    case "/cloud/download":
                        console.log("Cloud API: download");
                        this.cloudAPI.download(url.searchParams.get("sessionId"),
                                               url.searchParams.get("id"),
                                               url.searchParams.get("version"),
                                               url.searchParams.get("format"),
                                               response);
                        break;
                        
                    // Backend API
                    // Internal functionalities of the backend
                        
                    case "/backend/logout":
                        console.log("Backend API: logout");
                        this.backendAPI.logout(url.searchParams.get("sessionId"),
                                               response);
                        break;

                    // Frontend
                    case "/index.html":
                        response.setHeader("Content-Type", "text/html");
                        if(this.frontendHasMarker) {
                            const config: Config = {
                                demo: this.DEMO,
                                sessionId: this.sessionManager.newSession(),
                                formats: [ "zip", "pdf" ]
                            };
                            response.end(this.frontendBeforeMarker + JSON.stringify(config) + this.frontendAfterMarker);
                        } else {
                            response.end(this.frontendBeforeMarker);
                        }
                        console.log("SUCCESS");
                        break;

                    case "/favicon.svg":
                        response.setHeader("Content-Type", "image/svg+xml");
                        response.end(this.favicon);
                        console.log("SUCCESS");
                        break;

                    default:
                        this.serveErrorPage(response, 404, "Resource not found.");
                        break;
                }
            } else {
                this.serveErrorPage(response, 500, "Invalid request - Empty URL");
                return;
            }
        } catch(error) {
            this.serveErrorPage(response, 500, error instanceof Error ? error.message : "Unknown error");
        }
    }

    public serveErrorPage(response: http.ServerResponse, errorCode: number, error: string) {
        console.log("ERROR: "+errorCode + " - " + error);
        response.statusCode = errorCode;
        response.end("Error "+errorCode+"\n\n"+error);
    }

    /**
     * Start the HTTP server.
     */
    public run(): void {
        // Load SSL data
        let sslKey: Buffer|undefined = undefined;
        let sslCert: Buffer|undefined = undefined;
        try {
            sslKey = fs.readFileSync(Constants.SSL_KEY);
            sslCert = fs.readFileSync(Constants.SSL_CERT);
            this.protocol = "https";
        } catch(_) {
            this.protocol = "http";
        }

        // Initialize and launch HTTP/HTTPS server
        console.log("Use protocol: "+this.protocol);
        const server = this.protocol == "http"
              ? http.createServer()
              : https.createServer({key: sslKey, cert: sslCert});
        server.on('error', this.onHttpError.bind(this));
        server.on('request', this.onHttpRequest.bind(this));
        server.listen(8080);
    }
}
