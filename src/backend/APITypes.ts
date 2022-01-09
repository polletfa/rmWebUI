/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE file)
 *
 *****************************************************/

/**
 * Response status for API methods: success or error
 */
export enum APIResponseStatus {
    Success = "success",
    Error = "error"
}

// Allow any for typeguard:
// eslint-disable-next-line
export function isAPIResponseStatus(arg: any): arg is APIResponseStatus {
    return typeof arg === "string" && (
        arg === APIResponseStatus.Success || arg === APIResponseStatus.Error
    );
}

/**
 * Each API method respond with either a JSON or binary data.
 * When using a JSON, the format must comply with the following:
 *
 * On success:
 * - status = success
 * - data (optional): any object, depending on the API call
 *
 * On error:
 * - status = error
 * - errorType: a simple string identifying the origin of the error
 * - error: more detailed error or exception message
 */
export interface APIResponse {
    status: APIResponseStatus,
    errorType?: string,
    error?: string,
    data?: unknown
}

// Allow any for typeguard:
// eslint-disable-next-line 
export function isAPIResponse(arg: any): arg is APIResponse {
    return ("status" in arg) && isAPIResponseStatus(arg.status)
        && (arg.errorType === undefined || typeof arg.errorType === "string")
        && (arg.error === undefined || typeof arg.error === "string");
}
