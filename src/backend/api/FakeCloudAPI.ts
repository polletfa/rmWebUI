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

import { Server } from "../Server";
import { Constants } from "../Constants";
import { CloudAPIBase, Parameters } from "./CloudAPIBase";
import { CloudAPIResponseError } from "../types/CloudAPI";

/**
 * Implement the cloud API with dummy data (no connection to the cloud) for the demonstration mode
 */
export class FakeCloudAPI extends CloudAPIBase {
    constructor(server: Server) {
        super(server);
    }

    /**
     * API method: register the app
     *
     * @param sessionId Session ID
     * @param code One-time code for registering to the cloud. The fake API accepts Constants.FAKE_REGISTER_CODE as valid answer.
     * @param response HTTP response object
     */
    public register(sessionId: string, code: string|null, response: http.ServerResponse): void {
        this.doRequest(sessionId, {code: code}, CloudAPIResponseError.Register, false, response, (params: Parameters, response: http.ServerResponse) => {
            if(!("code" in params && params.code !== null)) throw new Error("request handler called with invalid parameters.");
            if(params.code !== this.server.config.fakeRegisterCode) {
                this.sendAPIResponseError(CloudAPIResponseError.Register,"This is a demo version. Use the code '"+this.server.config.fakeRegisterCode+"'.", response);
            } else {
                this.server.sessionManager.setValue(sessionId, "registered", true);
                this.sendAPIResponseSuccess(undefined, response);
            }
        });
    }
    
    /**
     * API method: get file list
     *
     * @param sessionId Session ID
     * @param response HTTP response object
     */
    public files(sessionId: string, response: http.ServerResponse): void {
        this.doRequest(sessionId, {}, CloudAPIResponseError.RetrieveFiles, true, response, (_: Parameters, response: http.ServerResponse) => {
            fs.readFile(Constants.SAMPLE_DATA_DIR+"/files.json", (err:Error|null, content:Buffer|null) => {
                if(err) {
                    this.sendAPIResponseError(CloudAPIResponseError.RetrieveFiles, err instanceof Error ? err.message : "Unknown error", response);
                } else {
                    this.sendAPIResponseSuccess({files: JSON.parse(content ? content.toString() : "")}, response);
                }
            });
        });
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
    public download(sessionId: string, id: string|null, version: string|null, format: string|null, response: http.ServerResponse): void {
        this.doRequest(sessionId, {id: id, version: version, format: format}, CloudAPIResponseError.DownloadFile, true, response, 
                     (params: Parameters, response: http.ServerResponse) => {
                         let file: string|undefined;
                         
                         if(!("id" in params && params.id !== null && "version" in params && params.version !== null && "format" in params && params.format !== null))
                             throw new Error("request handler called with invalid parameters.");
                         if(params.id[0] >= '0' && params.id[0] <= '4') {
                             file = "pdf";
                         } else if(params.id[0] >= '5' && params.id[0] <= '9') {
                             file = "notebook";
                         } else {
                             console.log(params.id[0]);
                             console.log(params.id[0] >= "0");
                             this.sendAPIResponseError(CloudAPIResponseError.DownloadFile, "This is an example of an error while downloading a file.", response);
                         }

                         if(file) {
                             fs.readFile(Constants.SAMPLE_DATA_DIR+"/sample_"+file+"."+params.format, (err: Error|null, content: Buffer|null) => {
                                 if(err) {
                                     this.sendAPIResponseError(CloudAPIResponseError.DownloadFile, err instanceof Error ? err.message : "Unknown error", response);
                                 } else {
                                     response.setHeader("Content-Type", "application/"+params.format);
                                     response.end(content ? content : "");
                                 }
                             });
                         }
                     });
    }

    protected doRequest(sessionId: string, params: Parameters, requestError: CloudAPIResponseError, requireRegistration: boolean, response: http.ServerResponse,
                      request: (params: Parameters, response: http.ServerResponse) => void): void
    {
        if(!this.checkRequest(sessionId, params, response)) return;

        // check the registration status
        if(requireRegistration && this.server.config.fakeRegisterCode != "" && this.server.sessionManager.getValue(sessionId, "registered") !== true) {
            this.sendAPIResponseError(CloudAPIResponseError.LoadToken, "This is a demo version. Register with the code '"+this.server.config.fakeRegisterCode+"'.", response);
        } else {
            // execute request
            setTimeout(() => {
                try {
                    request(params, response);
                } catch(error) {
                    this.sendAPIResponseError(requestError, error instanceof Error ? error.message : "Unknown error", response);
                }
            }, this.server.config.fakeDelay);
        }
    }
}
