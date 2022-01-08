/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE file)
 *
 *****************************************************/

import * as http from "http";
import * as https from "https";
import * as fs from "fs";

import { SessionManager } from "./SessionManager";
import { Constants } from "./Constants";

import { ICloudAPI } from "./ICloudAPI";
import { FakeCloudAPI } from "./FakeCloudAPI";
import { SessionAPI } from "./SessionAPI";
import { InfoAPI } from "./InfoAPI";

export class Backend {
    readonly cloudAPI: ICloudAPI;
    readonly sessionAPI: SessionAPI;
    readonly infoAPI: InfoAPI;
    readonly sessionManager: SessionManager;
    
    protected protocol: string = "";

    constructor() {
        this.cloudAPI = new FakeCloudAPI(this);
        this.sessionAPI = new SessionAPI(this);
        this.infoAPI = new InfoAPI(this);
        this.sessionManager = new SessionManager(this);
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
                
                switch(url.pathname) {
                // Cloud API
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

                // Session API
                case "/session/open":
                    console.log("Session API: open");
                    this.sessionAPI.open(response);
                    break;
                    
                case "/session/close":
                    console.log("Session API: close");
                    this.sessionAPI.close(url.searchParams.get("sessionId"), response);
                    break;

                // Info API
                case "/info/version":
                    console.log("Info API: version");
                    this.infoAPI.version(response);
                    break;

                // TODO: /info/config
                    
                // Frontend
                default:
                    const file = url.pathname == "/" ? "/index.html" : url.pathname;
                    fs.access(Constants.FRONTEND_DIR+file, fs.constants.R_OK, (err: Error|null) => {
                        if(err) {
                            this.serveErrorPage(response, 404, "Resource not found.");
                        } else {
                            console.log("File found");
                            fs.readFile(Constants.FRONTEND_DIR+file, (err: Error|null, content:Buffer|null) => {
                                if(err) {
                                    this.serveErrorPage(response, 500, err.message);
                                } else {
                                    response.end(content);
                                }
                            });
                        }
                    });
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
            sslKey = fs.readFileSync("data/key.pem");
            sslCert = fs.readFileSync("data/cert.pem");
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
