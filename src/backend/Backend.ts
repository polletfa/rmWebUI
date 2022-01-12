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
import { ConfigManager } from "./ConfigManager";

import { ICloudAPI } from "./ICloudAPI";
import { FakeCloudAPI } from "./FakeCloudAPI";
import { BackendAPI } from "./BackendAPI";

export class Backend {
    readonly NAME: string;
    readonly VERSION: string;
    
    readonly configManager: ConfigManager;

    readonly cloudAPI: ICloudAPI;
    readonly backendAPI: BackendAPI;
    readonly sessionManager: SessionManager;
    
    protected protocol = "";
    protected frontendHasMarker: boolean;
    protected frontendBeforeMarker: string;
    protected frontendAfterMarker: string;
    protected favicon: string;

    constructor() {
        this.configManager = new ConfigManager(this);

        this.cloudAPI = new FakeCloudAPI(this);
        this.backendAPI = new BackendAPI(this);
        this.sessionManager = new SessionManager(this);
        
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

    public onHttpError(error: Error): void {
        console.log("HTTP server error: "+error.message);
    }
    
    public onHttpRequest(request: http.IncomingMessage, response: http.ServerResponse) : void {
        try {
            if(request.url) {
                const url = new URL(request.url, this.protocol+"://"+request.headers.host);
                console.log("------------------------------------ " + (new Date()).toISOString());
                console.log(url.href);

                const host = request.headers.host?.split(":")[0];
                const localhostRequest = host === "localhost" || host?.substr(0, 4) === "127.";

                if(this.protocol == "http" && !localhostRequest && !this.configManager.config.demo) {
                    if(this.configManager.config.allowinsecure) {
                        console.log("SECURITY WARNING: Insecure request!");
                        console.log("SECURITY WARNING: Configure HTTPS or set allow-insecure to false to disable this message and protect your data!");
                    } else {
                        this.serveErrorPage(response, 403, "Forbidden");
                        return;
                    }
                }
                
                const sessionId = this.sessionManager.getOrCreateSession(request, response);
                
                switch(url.pathname == "/" ? "/index.html" : url.pathname) {
                    // Cloud API
                    // Access to the reMarkable(R) cloud

                    case "/cloud/register":
                        console.log("Cloud API: register");
                        this.cloudAPI.register(sessionId,
                                               url.searchParams.get("code"),
                                               response);
                        break;
                        
                    case "/cloud/files":
                        console.log("Cloud API: files");
                        this.cloudAPI.files(sessionId,
                                            response);
                        break;
                        
                    case "/cloud/download":
                        console.log("Cloud API: download");
                        this.cloudAPI.download(sessionId,
                                               url.searchParams.get("id"),
                                               url.searchParams.get("version"),
                                               url.searchParams.get("format"),
                                               response);
                        break;
                        
                    // Backend API
                    // Internal functionalities of the backend
                        
                    case "/backend/logout":
                        console.log("Backend API: logout");
                        this.backendAPI.logout(sessionId,
                                               response);
                        break;

                    // Frontend
                    case "/index.html":
                        console.log("Frontend: application");
                        response.setHeader("Content-Type", "text/html");
                        if(this.frontendHasMarker) {
                            response.end(this.frontendBeforeMarker + JSON.stringify(this.configManager.getFrontendConfig()) + this.frontendAfterMarker);
                        } else {
                            response.end(this.frontendBeforeMarker);
                        }
                        console.log("SUCCESS");
                        break;

                    case "/favicon.svg":
                        console.log("Frontend: favicon");
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
        // Show config
        console.log(this.NAME+" "+this.VERSION);
        console.log(JSON.stringify(this.configManager.config, null, 2));

        // select protocol and load SSL data if required
        // HTTP is only used if both SSL options are empty. HTTP should not be started by mistake because of a misconfiguration.
        let sslKey: Buffer|undefined = undefined;
        let sslCert: Buffer|undefined = undefined;
        if(this.configManager.config.ssl.key.length == 0 && this.configManager.config.ssl.cert.length == 0) {
            this.protocol = "http";

            if(!this.configManager.config.demo) {
                if(this.configManager.config.allowinsecure) {
                    console.log("SECURITY WARNING: SSL not configured and insecure requests allowed!");
                    console.log("SECURITY WARNING: Configure HTTPS or set allow-insecure to false to disable this message and protect your data!");
                } else {
                    console.log("INFO: SSL not configured. Only localhost requests are accepted.");
                }
            }
        } else {
            // Load SSL data
            sslKey = fs.readFileSync(this.configManager.config.ssl.key);
            sslCert = fs.readFileSync(this.configManager.config.ssl.cert);
            this.protocol = "https";
        }

        // Initialize and launch HTTP/HTTPS server
        console.log("Use protocol: "+this.protocol);
        const server = this.protocol == "http"
              ? http.createServer()
              : https.createServer({key: sslKey, cert: sslCert});
        server.on('error', this.onHttpError.bind(this));
        server.on('request', this.onHttpRequest.bind(this));
        server.listen(this.configManager.config.port);
    }
}
