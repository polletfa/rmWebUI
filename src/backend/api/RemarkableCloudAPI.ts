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

import { Remarkable } from 'remarkable-typescript';

import { Server } from "../Server";
import { Constants } from "../Constants";
import { CloudAPIBase } from "./CloudAPIBase";
import { CloudAPIResponseError } from "../types/CloudAPI";

/**
 * Implement the reMarkable(R) cloud API
 */
export class RemarkableCloudAPI extends CloudAPIBase {
    protected client: Remarkable;

    protected isConnected = false;
    
    constructor(server: Server) {
        super(server);

        this.client = new Remarkable();
    }

    /**
     * API method: register the app
     *
     * @param sessionId Session ID
     * @param code One-time code for registering to the cloud. The fake API accepts Constants.FAKE_REGISTER_CODE as valid answer.
     * @param response HTTP response object
     */
    public register(sessionId: string, code: string|null, response: http.ServerResponse): void {
        if(!this.checkRequest(sessionId, {code:code}, response)) return;

        this.client.register({code:String(code)})
            .then((deviceToken:string) => {
                this.isConnected = true;
                this.sendAPIResponseSuccess(undefined, response);
                
                this.server.data.writeToken(deviceToken)
                    .catch((error:Error) => {
                        this.server.log("ERROR: Unable to save the token: "+error.message);
                    });
            })
            .catch((error:Error) => {
                this.sendAPIResponseError(CloudAPIResponseError.Register, error.message, response);
            });
    }
    
    /**
     * API method: get file list
     *
     * @param sessionId Session ID
     * @param response HTTP response object
     */
    public files(sessionId: string, response: http.ServerResponse): void {
        if(!this.checkRequest(sessionId, {}, response)) return;
        this.sendAPIResponseError(CloudAPIResponseError.LoadToken, "Not yet implemented", response);
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
        /* unused: */ sessionId; id; version; format;
        this.sendAPIResponseError(CloudAPIResponseError.DownloadFile, "Not yet implemented", response);
    }
}
