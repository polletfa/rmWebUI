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
import { BackendAPI } from "./BackendAPI";

import { Config } from '../frontend/Config';

export class Backend {
    readonly NAME: string;
    readonly VERSION: string;
    readonly DEMO: boolean;
    
    readonly cloudAPI: ICloudAPI;
    readonly backendAPI: BackendAPI;
    readonly sessionManager: SessionManager;
    
    protected protocol = "";

    constructor() {
        this.cloudAPI = new FakeCloudAPI(this);
        this.backendAPI = new BackendAPI(this);
        this.sessionManager = new SessionManager(this);
        
        const package_json = JSON.parse(fs.readFileSync("package.json").toString());
        this.NAME = package_json.displayName;
        this.VERSION = package_json.version;
        this.DEMO = true;
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

                    // Frontend: serve anything in the FRONTEND_DIR folder.
                    // One exception: when index.html, some JavaScript is added at the end        
                    // followed by the content of FRONTEND_JSFILE
                    default:
                        this.serveFrontend(url.pathname, response);
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

    public serveFrontend(pathname: string, response: http.ServerResponse) {
        const index = "/index.html";
        const file = pathname == "/" ? index : pathname;
        
        const required = [Constants.FRONTEND_DIR + file];
        if(file == index) required.push(Constants.FRONTEND_DIR + "/" + Constants.FRONTEND_JSFILE);
 
        const checkAccess = required.map(file => new Promise<void>((res,rej) => {
            fs.access(file, fs.constants.R_OK, (err: Error|null) => {
                if(err) {
                    console.log(file + " not found");
                    rej();
                } else {
                    console.log(file + " found");
                    res();
                }
            });
        }));
        Promise.all(checkAccess)
            .then(() => {
                // all required files readable
                fs.readFile(Constants.FRONTEND_DIR+file, async (err: Error|null, content:Buffer|null) => {
                    if(err) {
                        this.serveErrorPage(response, 500, err.message);
                        return;
                    }

                    // set Mime-Type
                    let mimetype = undefined;
                    switch(file.substr(file.lastIndexOf(".")+1)) {
                        case "svg":  mimetype = "image/svg+xml"; break;
                        case "html": mimetype = "text/html"; break;
                        case "js":   mimetype = "text/javascript"; break;
                        case "css":  mimetype = "text/css"; break;
                    }
                    if(mimetype) {
                        response.setHeader("Content-Type", mimetype);
                    }
                    
                    if(file == index) {
                        const js = await this.getJavaScriptForFrontend();
                        response.end(content + js);
                    } else {
                        response.end(content);
                    }
                });
            })
            .catch(() => {
                this.serveErrorPage(response, 404, "Resource not found.");
            });
    }

    public async getJavaScriptForFrontend(): Promise<string> {
        const frontendJS = await new Promise<string>((res, rej) => fs.readFile(Constants.FRONTEND_DIR+"/"+Constants.FRONTEND_JSFILE, (err: Error|null, content: Buffer|null) => {
            if(err) rej();
            else res(content ? content.toString() : "");
        }));

        const config: Config = {
            name: this.NAME,
            version: this.VERSION,
            demo: this.DEMO,
            sessionId: this.sessionManager.newSession()
        };
        
        return "<script>"
            +"const config="+JSON.stringify(config)+";"
            +frontendJS
            + "</script>";
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
