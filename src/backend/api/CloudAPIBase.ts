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
     * API method: register the app
     *
     * @param sessionId Session ID
     * @param code One-time code for registering to the cloud. The fake API accepts Constants.FAKE_REGISTER_CODE as valid answer.
     * @param response HTTP response object
     */
    abstract register(sessionId: string|null, code: string|null, response: http.ServerResponse): void;

    /**
     * API method: get file list
     *
     * @param sessionId Session ID
     * @param response HTTP response object
     */
    abstract files(sessionId: string|null, response: http.ServerResponse): void;

    /**
     * API method: download file
     *
     * @param sessionId SessionID
     * @param id Id of the file to download
     * @param version Version of the file
     * @param format File format
     * @param response HTTP response object
     */
    abstract download(sessionId: string|null, id: string|null, version: string|null, format: string|null, response: http.ServerResponse): void;
}
