/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE file)
 *
 *****************************************************/

import * as http from "http";

import { Backend } from "./Backend";
import { APIBase } from "./APIBase";

export class BackendAPI extends APIBase {
    constructor(backend: Backend) {
        super(backend);
    }

    public logout(sessionId: string|null, response: http.ServerResponse): void {
        if(sessionId) {
            this.backend.sessionManager.deleteSession(sessionId);
        }
        this.sendAPIResponseSuccess(undefined, response);
    }
}
