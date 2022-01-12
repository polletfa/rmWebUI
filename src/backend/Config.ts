/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

export interface SSLConfig {
    cert: string;
    key: string;
}

export interface Config {
    port: number;
    demo: boolean;
    sessionMaxIdle: number;
    
    data: string;
    cache: boolean;
    pdfconverter: string;

    register: string;
    delay: number;
    
    ssl: SSLConfig;
    allowinsecure: boolean;
}

/**
 * Configuration passed by the backend to the frontend.
 */
export interface FrontendConfig {
    demo: boolean;           /**< True if the demonstration mode is enabled */
    formats: string[];       /**< Supported file formats */
    register: string;        /**< Register code for demonstration mode */
}

// eslint-disable-next-line
export function isFrontendConfig(arg: any): arg is FrontendConfig {
    if(!("demo" in arg) || (typeof arg.demo !== "boolean")
        || !("register" in arg) || (typeof arg.register !== "string")
        || !("formats" in arg) || !(Array.isArray(arg.formats))) return false;
    for(const i of arg.formats) {
        if(typeof i !== "string") return false;
    }
    return true;
}
