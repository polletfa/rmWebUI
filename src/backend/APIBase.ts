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

export enum APIResponseStatus {
    Success = "success",
    Error = "error"
}

export interface APIResponse {
    status: APIResponseStatus,
    errorType?: string,
    error?: string,
    data?: any
}

export class APIBase {
    protected backend: Backend;

    constructor(backend: Backend) {
        this.backend = backend;
    }

    public sendAPIResponseSuccess(data: any|undefined, response: http.ServerResponse): void {
        console.log("SUCCESS");
        response.end(JSON.stringify({
            status: APIResponseStatus.Success,
            data: data
        }));
    }

    public sendAPIResponseError(errorType: string, error: string, response: http.ServerResponse): void {
        console.log("ERROR: "+errorType+" - "+error);
        response.end(JSON.stringify({
            status: APIResponseStatus.Error,
            errorType: errorType,
            error: error
        }));
    }
}
