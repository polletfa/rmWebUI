/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as http from "http";

import { Server } from "./Server";
import { APIBase } from "./APIBase";

export class BackendAPI extends APIBase {
    constructor(server: Server) {
        super(server);
    }

    public logout(sessionId: string|null, response: http.ServerResponse): void {
        if(sessionId) {
            this.server.sessionManager.deleteSession(sessionId);
        }
        this.sendAPIResponseSuccess(undefined, response);
    }
}
