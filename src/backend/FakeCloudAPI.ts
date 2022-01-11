/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as http from "http";
import * as fs from "fs";

import { Backend } from "./Backend";
import { Constants } from "./Constants";
import { ICloudAPI } from "./ICloudAPI";
import { CloudAPIResponseError } from "./CloudAPITypes";

/**
 * Implement the cloud API with dummy data (no connection to the cloud) for the demonstration mode
 */
export class FakeCloudAPI extends ICloudAPI {
    constructor(backend: Backend) {
        super(backend);
    }

    /**
     * API method: register the app
     *
     * @param sessionId Session ID
     * @param code One-time code for registering to the cloud. The fake API accepts Constants.FAKE_REGISTER_CODE as valid answer.
     * @param response HTTP response object
     */
    public register(sessionId: string|null, code: string|null, response: http.ServerResponse): void {
        if(sessionId == null || code == null) {
            const missing: string[] = [];
            if(sessionId == null) missing.push("sessionId");
            if(code == null) missing.push("code");

            this.sendAPIResponseError(CloudAPIResponseError.InvalidParameters, "Missing parameter(s): "+missing.join(", "), response);
            return;
        }
        if(!this.backend.sessionManager.hasSession(sessionId)) {
            this.sendAPIResponseError(CloudAPIResponseError.InvalidParameters, "Invalid session", response);
            return;
        }            

        setTimeout(() => {
            if(code !== Constants.FAKE_REGISTER_CODE) {
                this.sendAPIResponseError(CloudAPIResponseError.Register,"This is a demo version. Use the code '"+Constants.FAKE_REGISTER_CODE+"'.", response);
            } else {
                this.backend.sessionManager.setValue(sessionId, "registered", true);
                this.sendAPIResponseSuccess(undefined, response);
            }
        }, Constants.FAKE_DELAY);
    }
    
    /**
     * API method: get file list
     *
     * @param sessionId Session ID
     * @param response HTTP response object
     */
    public files(sessionId: string|null, response: http.ServerResponse): void {
        if(sessionId == null) {
            this.sendAPIResponseError(CloudAPIResponseError.InvalidParameters, "Missing parameter(s): sessionId", response);
            return;
        }
        if(!this.backend.sessionManager.hasSession(sessionId)) {
            this.sendAPIResponseError(CloudAPIResponseError.InvalidParameters, "Invalid session", response);
            return;
        }
        if(this.backend.sessionManager.getValue(sessionId, "registered") !== true) {
            this.sendAPIResponseError(CloudAPIResponseError.LoadToken, "This is a demo version. Register with the code '"+Constants.FAKE_REGISTER_CODE+"'.", response);
        } else {
            setTimeout(() => {
                try {
                    fs.readFile(Constants.SAMPLE_DATA_DIR+"/files.json", (err:Error|null, content:Buffer|null) => {
                        if(err) {
                            this.sendAPIResponseError(CloudAPIResponseError.RetrieveFiles, err instanceof Error ? err.message : "Unknown error", response);
                        } else {
                            this.sendAPIResponseSuccess({files: JSON.parse(content ? content.toString() : "")}, response);
                        }
                    });
                } catch(error) {
                    this.sendAPIResponseError(CloudAPIResponseError.RetrieveFiles, error instanceof Error ? error.message : "Unknown error", response);
                }
            }, Constants.FAKE_DELAY);
        }
    }

    /**
     * API method: download file
     *
     * @param sessionId SessionID
     * @param id Id of the file to download
     * @param version Version of the file
     * @param format File format
     * @param response HTTP response object
     */
    public download(sessionId: string|null, id: string|null, version: string|null, format: string|null, response: http.ServerResponse): void {
        sessionId;
        id;
        version;
        format;
        response;
    }
}
