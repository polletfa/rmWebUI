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

import { Backend } from "./Backend";
import { ServerConfig } from "./Config";
import { Constants } from "./Constants";
import { SessionManager } from "./SessionManager";

import { ICloudAPI } from "./ICloudAPI";
import { FakeCloudAPI } from "./FakeCloudAPI";
import { BackendAPI } from "./BackendAPI";

export class HTTPServer {
    readonly backend: Backend;
    readonly config: ServerConfig;
    readonly sessionManager: SessionManager;

    readonly cloudAPI: ICloudAPI;
    readonly backendAPI: BackendAPI;
    
    readonly protocol: string;
    readonly sslKey: string;
    readonly sslCert: string;

    readonly logprefix: string;
    
    constructor(backend: Backend, config: ServerConfig) {
        this.backend = backend;
        this.config = config;
        this.logprefix = "[" + config.name + "]   ";
        this.sessionManager = new SessionManager(this);

        this.cloudAPI = new FakeCloudAPI(this);
        this.backendAPI = new BackendAPI(this);

        this.showModifiedConfig();

        // select protocol and load SSL data if required
        // HTTP is only used if both SSL options are empty. HTTP should not be started by mistake because of a misconfiguration.
        if(this.config.ssl.key.length == 0 && this.config.ssl.cert.length == 0) {
            this.protocol = "http";
            this.sslKey = "";
            this.sslCert = "";
            
            if(!this.config.demo) {
                if(this.config.allowInsecure) {
                    this.log("SECURITY WARNING: SSL not configured and insecure requests allowed!");
                    this.log("SECURITY WARNING: Configure HTTPS or set allow-insecure to false to disable this message and protect your data!");
                } else {
                    this.log("INFO: SSL not configured. Only localhost requests are accepted.");
                }
            }
        } else {
            // Load SSL data
            this.sslKey = fs.readFileSync(this.config.ssl.key, "utf8");
            this.sslCert = fs.readFileSync(this.config.ssl.cert, "utf8");
            this.protocol = "https";
        }
    }

    public showModifiedConfig(): void {
        // eslint-disable-next-line
        const objDiff = (objOrig: any, ref: any): any => {
            const obj = Object.assign({}, objOrig);
            for(const key of Object.keys(obj)) {
                if(typeof obj[key] == "object") obj[key] = objDiff(obj[key], ref[key]);
                else if(obj[key] === ref[key]) obj[key] = undefined;
            }
            return JSON.stringify(obj) == "{}" ? undefined : obj;
        };
        const diff = objDiff(this.config, Constants.DEFAULT_CONFIG);
        
        this.log(this.config.name+" = "+(diff ? JSON.stringify(diff, null, 2) : "default"));
    }
    
    public log(msg: string) {
        this.backend.log(this.logprefix + msg.split("\n").join("\n"+this.logprefix));
    }

    public onHttpError(error: Error): void {
        this.log("ERROR: "+error.message);
    }
    
    public onHttpRequest(request: http.IncomingMessage, response: http.ServerResponse) : void {
        try {
            if(request.url) {
                const url = new URL(request.url, this.protocol+"://"+request.headers.host);

                this.log("---");
                this.log(JSON.stringify({
                    protocol: this.protocol,
                    host: request.headers.host,
                    resource: request.url,
                    remoteAddress: request.socket.remoteAddress,
                    headers: this.config.logHeaders ? request.headers : undefined
                }, null, 2));

                const localhostRequest = request.socket.remoteAddress === "::ffff:127.0.0.1"
                    || request.socket.remoteAddress === "127.0.0.1"
                    || request.socket.remoteAddress === "::1";

                if(this.protocol == "http" && !localhostRequest && !this.config.demo) {
                    if(this.config.allowInsecure) {
                        this.log("SECURITY WARNING: Insecure request!");
                        this.log("SECURITY WARNING: Configure HTTPS or set allow-insecure to false to disable this message and protect your data!");
                    } else {
                        this.log("ERROR: Only local requests accepted.");
                        this.serveErrorPage(response, 403, "Forbidden");
                        return;
                    }
                }
                
                const sessionId = this.sessionManager.getOrCreateSession(request, response);
                
                switch(url.pathname == "/" ? "/index.html" : url.pathname) {
                    // Cloud API
                    // Access to the reMarkable(R) cloud

                    case "/cloud/register":
                        this.log("Cloud API: register");
                        this.cloudAPI.register(sessionId,
                                               url.searchParams.get("code"),
                                               response);
                        break;
                        
                    case "/cloud/files":
                        this.log("Cloud API: files");
                        this.cloudAPI.files(sessionId,
                                            response);
                        break;
                        
                    case "/cloud/download":
                        this.log("Cloud API: download");
                        this.cloudAPI.download(sessionId,
                                               url.searchParams.get("id"),
                                               url.searchParams.get("version"),
                                               url.searchParams.get("format"),
                                               response);
                        break;
                        
                    // Backend API
                    // Internal functionalities of the backend
                        
                    case "/backend/logout":
                        this.log("Backend API: logout");
                        this.backendAPI.logout(sessionId,
                                               response);
                        break;

                    // Frontend
                    case "/index.html":
                        this.log("Frontend: application");
                        response.setHeader("Content-Type", "text/html");
                        response.end(this.backend.getFrontend(this.config));
                        this.log("SUCCESS");
                        break;

                    case "/favicon.svg":
                        this.log("Frontend: favicon");
                        response.setHeader("Content-Type", "image/svg+xml");
                        response.end(this.backend.getFavicon());
                        this.log("SUCCESS");
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
        this.log("ERROR: "+errorCode + " - " + error);
        response.statusCode = errorCode;
        response.end("Error "+errorCode+"\n\n"+error);
    }

    /**
     * Start the HTTP server.
     */
    public run(): void {
        // Initialize and launch HTTP/HTTPS server
        this.log("Use protocol: "+this.protocol);
        const server = this.protocol == "http"
            ? http.createServer()
            : https.createServer({key: this.sslKey, cert: this.sslCert});
        server.on('error', this.onHttpError.bind(this));
        server.on('request', this.onHttpRequest.bind(this));
        server.listen(this.config.port);
    }
}
