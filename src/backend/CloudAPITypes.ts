/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE file)
 *
 *****************************************************/

/**
 * Error types for the cloud API
 */
export enum CloudAPIResponseError {
    InvalidParameters = "invalid-parameters",
    Register = "register",
    LoadToken = "load-token",
    InitAPI = "init-api",
    RetrieveFiles = "retrieve-files",
    DownloadFile = "download-file",
    ConvertFile = "convert-file",
}

/**
 * Item type for the cloud API
 */
export enum CloudAPIResponseFileType {
    Document = "DocumentType",
    Collection = "CollectionType"
}

/**
 * Item for the cloud API
 */
export interface CloudAPIResponseFileItem {
    id: string,
    version: string,
    type: CloudAPIResponseFileType,
    name: string,
    path: string,
    parent: string
}

/**
 * Format of the data element of the response for the 'files' request
 */
export interface CloudAPIResponseDataFiles {
    files: CloudAPIResponseFileItem[]
}
