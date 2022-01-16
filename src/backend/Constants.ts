/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import { ServerConfig } from "./types/Config";

export class Constants {
    /**
     * Location of the default configuration file when none is provided as command line parameter
     */
    static readonly CONFIG_FILE = "config.yml";

    /**
     * Frontend
     */
    static readonly FRONTEND_HTML = "frontend/index.html";

    /**
     * Favicon
     */
    static readonly FRONTEND_FAVICON = "frontend/favicon.svg";
    
    /**
     * Marker for the configuration passed to the frontend
     */
    static readonly FRONTEND_MARKER = "<!FrontendConfig>";
    
    /**
     * Live Demonstration: location of the sample data for the FakeCloudAPI
     */
    static readonly SAMPLE_DATA_DIR = "backend/samples";

    /**
     * Default configuration
     */
    static readonly DEFAULT_CONFIG: ServerConfig = {
        name: "default",
        
        port: 8080,
        demo: false,
        sessionMaxIdle: 24*60*60*1000,
        logHeaders: false,
        
        ssl: {
            cert: "",
            key: ""
        },
        allowInsecure: false,
        
        data: "data",
        cache: true,
        pdfconverter: "",

        fakeRegisterCode: "abcdefgh",
        fakeDelay: 2000
    };

}
