/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE file)
 *
 *****************************************************/

import * as http from "http";

export enum CloudAPIResponseStatus {
    Success = "success",
    Error = "error"
}

export enum CloudAPIResponseError {
    InvalidParameters = "invalid-parameters",
    Register = "register",
    LoadToken = "load-token",
    InitAPI = "init-api",
    RetrieveFiles = "retrieve-files",
    DownloadFile = "download-file",
    ConvertFile = "convert-file",
}

export enum CloudAPIResponseFileType {
    Document = "DocumentType",
    Collection = "CollectionType"
}

export interface CloudAPIResponseFileItem {
    id: string,
    version: string,
    type: CloudAPIResponseFileType,
    name: string,
    path: string,
    parent: string
}

export interface CloudAPIResponse {
    status: CloudAPIResponseStatus,
    errorType?: CloudAPIResponseError,
    error?: string,
    files?: CloudAPIResponseFileItem[]
}

export abstract class ICloud {
    abstract register(sessionId: string|null, code: string|null, response: http.ServerResponse): void;
    abstract files(sessionId: string|null, response: http.ServerResponse): void;
    abstract download(sessionId: string|null, id: string|null, version: string|null, format: string|null, response: http.ServerResponse): void;
}
