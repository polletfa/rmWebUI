/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as http from "http";

import { Server } from "../Server";
import { APIBase } from "./APIBase";

export class BackendAPI extends APIBase {
    constructor(server: Server) {
        super(server);
    }


    /**
     * Handle a HTTP request
     *
     * @param url Parsed URL
     * @param sessionId Session ID
     * @param response HTTP response object
     * @return True if the request is supported by the module, false otherwise
     */
    public handleRequest(url: URL, sessionId: string, response: http.ServerResponse): boolean {
        switch(url.pathname) {
            case "/backend/logout":
                this.server.log("Backend API: logout");
                this.logout(sessionId,
                            response);
                return true;

            default:
                return false; // not an API request
        }
    }

    public logout(sessionId: string|null, response: http.ServerResponse): void {
        if(sessionId) {
            this.server.sessionManager.deleteSession(sessionId);
        }
        this.sendAPIResponseSuccess(undefined, response);
    }
}
