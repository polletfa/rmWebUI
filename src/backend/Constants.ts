/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

export class Constants {
    /**
     * Location of the SSL certificate
     */
    static readonly SSL_CERT = "data/ssl/cert.pem";
    
    /**
     * Location of the SSL private key
     */
    static readonly SSL_KEY = "data/ssl/key.pem";

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
    static readonly FRONTEND_MARKER = "<!backendconfig>";
    
    /**
     * Live Demonstration: location of the sample data for the FakeCloudAPI
     */
    static readonly SAMPLE_DATA_DIR = "backend/samples";

    /**
     * Live Demonstration: register code for the FakeCloudAPI
     */
    static readonly FAKE_REGISTER_CODE = "abcdefgh";

    /**
     * Live Demonstration: delay to simulate cloud request for the FakeCloudAPI
     */
    static readonly FAKE_DELAY = 2000;

    /**
     * Duration a session stays alive if it is not used.
     */
    static readonly SESSION_TIME_ALIVE = 24*60*60*1000; // 24 hours

}
