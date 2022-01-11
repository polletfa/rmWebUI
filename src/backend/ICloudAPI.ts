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

/**
 * Common interface for real and fake cloud API
 */
export abstract class ICloudAPI extends APIBase {
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
