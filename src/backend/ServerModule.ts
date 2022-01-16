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

export abstract class ServerModule {
    readonly server: Server;

    constructor(server: Server) { this.server = server; }
    
    /**
     * Handle a HTTP request.
     * The method must either:
     * - send a 200 response and return true,
     * - return false (request not supported) or
     * - throw an exception (internal error)
     *
     * @param url Parsed URL
     * @param sessionId Session ID
     * @param response HTTP response object
     * @return True if the request is supported by the module, false otherwise
     */
    public abstract handleRequest(url: URL, sessionId: string, response: http.ServerResponse): boolean;

    /**
     * Handle an error.
     * This method must either:
     * - send a HTTP response with the appropriate code and return true,
     * - send false (the module doesn't handle errors)
     * - throw an exception (internal error)
     *
     * @param statusCode HTTP response code
     * @param error Error message
     * @param response HTTP response object
     * @return True if the module handles errors, false otherwise
     */
    public abstract handleError(statusCode: number, error: string, response: http.ServerResponse): boolean;
}
