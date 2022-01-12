/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as http from "http";

import { HTTPServer } from "./HTTPServer";
import { APIResponseStatus } from "./APITypes";

/**
 * Base for API definitions.
 */
export class APIBase {
    protected server: HTTPServer;

    /**
     * @param backend Instance of the backend
     */
    constructor(server: HTTPServer) {
        this.server = server;
    }

    /**
     * Send a generic "success" message.
     *
     * @param data Data specific to the API call
     * @param response HTTP Response object
     */
    public sendAPIResponseSuccess(data: unknown|undefined, response: http.ServerResponse): void {
        this.server.log("SUCCESS");
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
        response.end(JSON.stringify({
            status: APIResponseStatus.Error,
            errorType: errorType,
            error: error
        }));
    }
}
