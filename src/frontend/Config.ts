/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE file)
 *
 *****************************************************/

/**
 * Configuration passed by the backend to the frontend.
 */
export interface Config {
    name: string;            /**< Application name */
    version: string;         /**< Application version */
    demo: boolean;           /**< True if the demonstration mode is enabled */
    sessionId: string;       /**< Session ID required to communicate with the backend */
    formats: string[];       /**< Supported file formats */
}
