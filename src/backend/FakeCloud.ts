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
import { ICloud, CloudAPIResponse, CloudAPIResponseStatus, CloudAPIResponseError } from "./ICloud";

export class FakeCloud extends ICloud {
    readonly FAKE_REGISTER_CODE = "abcdefgh";
    readonly FAKE_DELAY = 2000;
    
    protected backend: Backend;

    constructor(backend: Backend) {
        super();
        this.backend = backend;
    }
    
    public register(sessionId: string|null, code: string|null, response: http.ServerResponse): void {
        if(sessionId == null || code == null) {
            const missing: string[] = [];
            if(sessionId == null) missing.push("sessionId");
            if(code == null) missing.push("code");
            
            response.end(JSON.stringify({
                status: CloudAPIResponseStatus.Error,
                errorType: CloudAPIResponseError.InvalidParameters,
                error: "Missing parameter(s): "+missing.join(", ")
            }));
            return;
        }
        if(!this.backend.sessionManager.hasSession(sessionId)) {
            response.end(JSON.stringify({
                status: CloudAPIResponseStatus.Error,
                errorType: CloudAPIResponseError.InvalidParameters,
                error: "Invalid session"
            }));
            return;
        }            

        setTimeout(() => {
            if(code !== this.FAKE_REGISTER_CODE) {
                response.end(JSON.stringify({
                    status: CloudAPIResponseStatus.Error,
                    errorType: CloudAPIResponseError.Register,
                    error: "This is a demo version. Use the code '"+this.FAKE_REGISTER_CODE+"'."
                }));
            } else {
                this.backend.sessionManager.setValue(sessionId, "registered", true);
                response.end(JSON.stringify({
                    status: CloudAPIResponseStatus.Success
                }));
            }
        }, this.FAKE_DELAY)
    }
    
    public files(sessionId: string|null, response: http.ServerResponse): void {
        if(sessionId == null) {
            response.end(JSON.stringify({
                status: CloudAPIResponseStatus.Error,
                errorType: CloudAPIResponseError.InvalidParameters,
                error: "Missing parameter(s): sessionId"
            }));
            return;
        }
        if(!this.backend.sessionManager.hasSession(sessionId)) {
            response.end(JSON.stringify({
                status: CloudAPIResponseStatus.Error,
                errorType: CloudAPIResponseError.InvalidParameters,
                error: "Invalid session"
            }));
            return;
        }
        if(this.backend.sessionManager.getValue(sessionId, "registered") !== true) {
            response.end(JSON.stringify({
                status: CloudAPIResponseStatus.Error,
                errorType: CloudAPIResponseError.LoadToken,
                error: "This is a demo version. Register with the code '"+this.FAKE_REGISTER_CODE+"'."
            }));
        } else {
            setTimeout(() => {
                try {
                    response.end(JSON.stringify({
                        status: CloudAPIResponseStatus.Success,
                        files: JSON.parse(fs.readFileSync("sampledata/files.json").toString())
                    }));
                } catch(error) {
                    response.end(JSON.stringify({
                        status: CloudAPIResponseStatus.Error,
                        errorType: CloudAPIResponseError.RetrieveFiles,
                        error: error instanceof Error ? error.message : "Unknown error"
                    }));
                }
            }, this.FAKE_DELAY);
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
