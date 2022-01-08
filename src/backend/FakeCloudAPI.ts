/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE file)
 *
 *****************************************************/

import * as http from "http";
import * as fs from "fs";

import { Backend } from "./Backend";
import { Constants } from "./Constants";
import { APIResponseStatus } from "./APIBase";
import { ICloudAPI, CloudAPIResponseError } from "./ICloudAPI";

export class FakeCloudAPI extends ICloudAPI {
    constructor(backend: Backend) {
        super(backend);
    }
    
    public register(sessionId: string|null, code: string|null, response: http.ServerResponse): void {
        if(sessionId == null || code == null) {
            const missing: string[] = [];
            if(sessionId == null) missing.push("sessionId");
            if(code == null) missing.push("code");

            this.sendAPIResponseError(CloudAPIResponseError.InvalidParameters, "Missing parameter(s): "+missing.join(", "), response)
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
        }, Constants.FAKE_DELAY)
    }
    
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
                    this.sendAPIResponseSuccess({files: JSON.parse(fs.readFileSync(Constants.SAMPLE_DATA_DIR+"/files.json").toString())}, response);
                } catch(error) {
                    this.sendAPIResponseError(CloudAPIResponseError.RetrieveFiles, error instanceof Error ? error.message : "Unknown error", response);
                }
            }, Constants.FAKE_DELAY);
        }
    }
    
    public download(sessionId: string|null, id: string|null, version: string|null, format: string|null, response: http.ServerResponse): void {
        sessionId;
        id;
        version;
        format;
        response;
    }
}
