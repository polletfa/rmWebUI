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

import { ICloud } from "./ICloud";
import { FakeCloud } from "./FakeCloud";
import { SessionManager } from "./SessionManager";
import { Info } from "./Info";

export class Backend {
    readonly cloud: ICloud;
    readonly info: Info;
    readonly sessionManager: SessionManager;
    
    protected protocol: string = "";

    constructor() {
        this.cloud = new FakeCloud(this);
        this.info = new Info(this);
        this.sessionManager = new SessionManager(this);
    }

    public onHttpError(error: Error): void {
        console.log("HTTP server error: "+error.message);
    }
    
    public onHttpRequest(request: http.IncomingMessage, response: http.ServerResponse) : void {
        try {
            if(request.url) {
                const url = new URL(request.url, this.protocol+"://"+request.headers.host);

                switch(url.pathname) {
                case "/cloud/register":
                    console.log("Cloud API: register");
                    this.cloud.register(url.searchParams.get("sessionId"),
                                        url.searchParams.get("code"),
                                        response);
                    return;

                case "/cloud/files":
                    console.log("Cloud API: files");
                    this.cloud.files(url.searchParams.get("sessionId"),
                                     response);
                    return;

                case "/cloud/download":
                    console.log("Cloud API: download");
                    this.cloud.download(url.searchParams.get("sessionId"),
                                        url.searchParams.get("id"),
                                        url.searchParams.get("version"),
                                        url.searchParams.get("format"),
                                        response);
                    return;

                case "/info/open":
                    console.log("Info API: open");
                    this.info.open(response);
                    return;
                    
                case "/info/close":
                    console.log("Info API: close");
                    this.info.close(url.searchParams.get("sessionId"), response);
                    return;
                    
                }
            } else {
                this.serveErrorPage(response, 500, "Invalid request - Empty URL");
                return;
            }
            this.serveErrorPage(response, 404, "Resource not found.");
        } catch(error) {
            this.serveErrorPage(response, 500, error instanceof Error ? error.message : "Unknown error");
        }
    }

    public serveErrorPage(response: http.ServerResponse, errorCode: number, error: string) {
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
