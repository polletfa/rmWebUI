/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import { Modal } from "bootstrap";

import { Layout } from './Layout';
import { RegisterPage } from './RegisterPage';
import { ListPage } from './ListPage';
import { APIRequest } from './APIRequest';

import { FrontendConfig, isFrontendConfig } from '../backend/types/Config';
import { APIResponse, isAPIResponse, APIResponseStatus } from '../backend/types/API';
import { CloudAPIResponseError } from '../backend/types/CloudAPI';

// extend Window to add a reference to the FrontendApplication instance
interface CustomWindow extends Window {
    application: FrontendApplication;
}
declare let window: CustomWindow;

export interface PageList {
    register: RegisterPage;
    list: ListPage;
}

/**
 * Main class for the JavaScript logic of the website
 */
export class FrontendApplication {
    readonly config: FrontendConfig;                            /**< Configuration provided by the backend */
    readonly layout: Layout;                                    /**< Manage layout */
    
    public filesApiResponse: APIResponse|undefined = undefined; /**< Response of /cloud/files */
    public pages : PageList = {                                 /**< List of pages */
        register: new RegisterPage(this),
        list: new ListPage(this)
    };
    
   
    /**
     * @param config Configuration provided by the backend
     */
    constructor() {
        window.application = this; // save the main class in the window object to be able to access it globally

        // read backend config
        const bc = document.getElementById("FrontendConfig");
        if(bc instanceof HTMLElement) {
            const loadedConf = JSON.parse(bc.innerHTML);
            if(isFrontendConfig(loadedConf)) {
                this.config = loadedConf;
            } else {
                throw new Error("FrontendConfig is invalid.");
            }
        } else {
            throw new Error("FrontendConfig not found.");
        }

        this.layout = new Layout(this);

        switch(this.config.statusCode) {
            case 200:
                this.getFiles();
                break;
            case 403:
                this.layout.showError("403 Forbidden", this.config.error == "" ? "Unknown error" : this.config.error);
                break;
            case 404:
                this.layout.showError("404 Not Found", this.config.error == "" ? "Unknown error" : this.config.error);
                break;
            case 500:
                this.layout.showError("500 Internal Server Error", this.config.error == "" ? "Unknown error" : this.config.error);
                break;
            default:
                this.layout.showError("Unexpected HTTP status code "+this.config.statusCode, this.config.error == "" ? "Unknown error" : this.config.error);
                break;
        }

        if(this.config.insecure) {
            const el = document.getElementById("insecure-dialog");
            if(el instanceof HTMLElement) {
                Modal.getOrCreateInstance(el).toggle();
            }
        }
    }

    /**
     * Refresh the interface based on the response from ../backend/api/files.php provided in argument
     */
    refresh(): void {
        this.layout.show('loading-spinner', false);
        if(isAPIResponse(this.filesApiResponse) && this.filesApiResponse.status === APIResponseStatus.Error) {
            switch(this.filesApiResponse["errorType"] as CloudAPIResponseError) {
                case CloudAPIResponseError.InternalError:
                    this.layout.showError("Internal error while processing the request.", this.filesApiResponse["error"] ? this.filesApiResponse["error"] : "Unknown error");
                    break;
                case CloudAPIResponseError.LoadToken:
                    this.layout.showPage("register");
                    break;
                case CloudAPIResponseError.InitAPI:
                    this.layout.showError("Unable to connect to the cloud! You may try to register again.", this.filesApiResponse["error"] ? this.filesApiResponse["error"] : "Unknown error");
                    this.layout.showPage("register");
                    break;
                case CloudAPIResponseError.RetrieveFiles:
                    this.layout.showError("Unable to retrieve file list from the cloud!", this.filesApiResponse["error"] ? this.filesApiResponse["error"] : "Unknown error");
                    this.layout.showPage(""); // hide all pages
                    break;
                default:
                    this.layout.showError("Unexpected (" + this.filesApiResponse["errorType"] + ")", this.filesApiResponse["error"] ? this.filesApiResponse["error"] : "Unknown error");
                    this.layout.showPage(""); // hide all pages
            }
        } else if(isAPIResponse(this.filesApiResponse)) {
            this.layout.showPage("list");
        } else {
            this.layout.showError("Unexpected response from backend", JSON.stringify(this.filesApiResponse));
            this.layout.showPage("");
        }
        this.layout.resizeHeader();
    }
   
    /**
     * Get file list and update UI
     */
    public getFiles(): void {
        new APIRequest(this, "/cloud/files")
            .onReceiveJSON((response) => {
                this.filesApiResponse = response;
            })
            .onFinish(() => {
                this.refresh();
            });
    }
}
