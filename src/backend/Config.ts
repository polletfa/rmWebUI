/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

/**
 * Configuration passed by the backend to the frontend.
 */
export interface Config {
    demo: boolean;           /**< True if the demonstration mode is enabled */
    sessionId: string;       /**< Session ID required to communicate with the backend */
    formats: string[];       /**< Supported file formats */
}

// Allow any for typeguard:
// eslint-disable-next-line
export function isConfig(arg: any): arg is Config {
    if(!("demo" in arg) || (typeof arg.demo !== "boolean")
        || !("sessionId" in arg) || (typeof arg.sessionId !== "string")
        || !("formats" in arg) || !(Array.isArray(arg.formats))) return false;
    for(const i of arg.formats) {
        if(typeof i !== "string") return false;
    }
    return true;
}
