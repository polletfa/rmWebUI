/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as http from "http";

import { APIBase } from "./APIBase";
import { Server } from "../Server";

import { CloudAPIResponseError } from "../types/CloudAPI";

export type Parameters = {[name:string]: string|null};

/**
 * Common interface for real and fake cloud API
 */
export abstract class CloudAPIBase extends APIBase {
    constructor(server: Server) {
        super(server);
    }

    /**
     * Handle a HTTP request
     *
     * @param url Parsed URL
     * @param sessionId Session ID
     * @param response HTTP response object
     * @return True if the request is supported by the API, false otherwise (not an API request)
     */
    public handleRequest(url: URL, sessionId: string, response: http.ServerResponse): boolean {
        switch(url.pathname) {
            case "/cloud/register":
                this.server.log("Cloud API: register");
                this.register(sessionId,
                              url.searchParams.get("code"),
                              response);
                return true;
                
            case "/cloud/files":
                this.server.log("Cloud API: files");
                this.files(sessionId,
                           response);
                return true;
                
            case "/cloud/download":
                this.server.log("Cloud API: download");
                this.download(sessionId,
                              url.searchParams.get("id"),
                              url.searchParams.get("version"),
                              url.searchParams.get("format"),
                              response);
                return true;

            default:
                return false; // not an API request
        }
    }

    /**
     * Check request:
     * - Session exists
     * - Parameters are not null or empty
     * Send an error response if the request is not valid.
     *
     * @param sessionId Session ID
     * @param params: Parameters as key-value pairs
     * @param response HTTP response object
     * @return Request validity trus/false
     */
    protected checkRequest(sessionId: string, params: Parameters, response: http.ServerResponse): boolean
    {
        // check parameters
        const missing: string[] = [];
        for(const param in params) {
            if(params[param] == null || params[param] == "") missing.push(param);
        }
        if(missing.length > 0) {
            this.sendAPIResponseError(CloudAPIResponseError.InvalidParameters, "Missing parameter" + (missing.length == 1 ? "" : "s" ) + ": "+missing.join(", "), response);
            return false;
        }

        // check session
        if(!this.server.sessionManager.hasSession(sessionId)) {
            this.sendAPIResponseError(CloudAPIResponseError.InvalidParameters, "Invalid session", response);
            return false;
        }
        
        return true;
    }

    /**
     * API method: register the app
     *
     * @param sessionId Session ID
     * @param code One-time code for registering to the cloud. The fake API accepts Constants.FAKE_REGISTER_CODE as valid answer.
     * @param response HTTP response object
     */
    abstract register(sessionId: string, code: string|null, response: http.ServerResponse): void;

    /**
     * API method: get file list
     *
     * @param sessionId Session ID
     * @param response HTTP response object
     */
    abstract files(sessionId: string, response: http.ServerResponse): void;

    /**
     * API method: download file
     *
     * @param sessionId SessionID
     * @param id Id of the file to download
     * @param version Version of the file
     * @param format File format
     * @param response HTTP response object
     */
    abstract download(sessionId: string, id: string|null, version: string|null, format: string|null, response: http.ServerResponse): void;
}
