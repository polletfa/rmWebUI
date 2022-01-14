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
import { ServerModule } from "../ServerModule";
import { APIResponseStatus } from "../types/API";

/**
 * Base for API definitions.
 */
export abstract class APIBase extends ServerModule {
    /**
     * @param backend Instance of the backend
     */
    constructor(server: Server) {
        super(server);
    }

    /**
     * Handle an error - not supported by API modules
     * @return False
     */
    public handleError(_unused1: number, _unused2: string, _unused3: http.ServerResponse): boolean {
        return false;
    }

    /**
     * Send a generic "success" message.
     *
     * @param data Data specific to the API call
     * @param response HTTP Response object
     */
    public sendAPIResponseSuccess(data: unknown|undefined, response: http.ServerResponse): void {
        this.server.log("SUCCESS");
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({
            status: APIResponseStatus.Success,
            data: data
        }));
    }

    /**
     * Send a generic "error" message.
     *
     * @param errorType Error type/code
     * @param error Error message
     * @param response HTTP Response object
     */
    public sendAPIResponseError(errorType: string, error: string, response: http.ServerResponse): void {
        this.server.log("ERROR: "+errorType+" - "+error);
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({
            status: APIResponseStatus.Error,
            errorType: errorType,
            error: error
        }));
    }
}
