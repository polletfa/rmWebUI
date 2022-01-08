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

export class Info {
    protected backend: Backend;

    constructor(backend: Backend) {
        this.backend = backend;
    }

    public open(response: http.ServerResponse): void {
        const sessionId = this.backend.sessionManager.newSession();
        response.end(JSON.stringify({sessionId: sessionId}));
    }

    public close(sessionId: string|null, response: http.ServerResponse): void {
        if(sessionId) {
            this.backend.sessionManager.deleteSession(sessionId);
        }
        response.end(JSON.stringify({}));
    }
}
