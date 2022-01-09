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

// Allow any for typeguard:
// eslint-disable-next-line
export function isCloudAPIResponseError(arg: any): arg is CloudAPIResponseError {
    return typeof arg === "string" && (
        arg == CloudAPIResponseError.InvalidParameters 
            || arg == CloudAPIResponseError.Register
            || arg == CloudAPIResponseError.LoadToken
            || arg == CloudAPIResponseError.InitAPI
            || arg == CloudAPIResponseError.RetrieveFiles
            || arg == CloudAPIResponseError.DownloadFile
            || arg == CloudAPIResponseError.ConvertFile
    );
}

/**
 * Item type for the cloud API
 */
export enum CloudAPIResponseFileType {
    Document = "DocumentType",
    Collection = "CollectionType"
}


// Allow any for typeguard:
// eslint-disable-next-line
export function isCloudAPIResponseFileType(arg: any): arg is CloudAPIResponseFileType {
    return typeof arg === "string" && (
        arg == CloudAPIResponseFileType.Document || arg == CloudAPIResponseFileType.Collection
    );
}


/**
 * Item for the cloud API
 */
export interface CloudAPIResponseFileItem {
    id: string,
    version: number,
    type: CloudAPIResponseFileType,
    name: string,
    path: string,
    parent: string
}

// Allow any for typeguard:
// eslint-disable-next-line
export function isCloudAPIResponseFileItem(arg: any): arg is CloudAPIResponseFileItem {
    return ("id" in arg) && (typeof arg.id === "string")
        && ("version" in arg) && (typeof arg.version === "number")
        && ("type" in arg) && isCloudAPIResponseFileType(arg.type)
        && ("name" in arg) && (typeof arg.name === "string")
        && ("path" in arg) && (typeof arg.path === "string")
        && ("parent" in arg) && (typeof arg.parent === "string");
}

/**
 * Format of the data element of the response for the 'files' request
 */
export interface CloudAPIResponseDataFiles {
    files: CloudAPIResponseFileItem[]
}

// Allow any for typeguard:
// eslint-disable-next-line
export function isCloudAPIResponseDataFiles(arg: any): arg is CloudAPIResponseDataFiles {
    if(("files" in arg) && Array.isArray(arg.files)) {
        for(const i of arg.files) {
            if(!isCloudAPIResponseFileItem(i)) return false;
        }
        return true;
    } else {
        return false;
    }    
}
