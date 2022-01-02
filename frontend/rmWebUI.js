/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE file)
 *
 *****************************************************/

/**
 * Main class for the JavaScript logic of the website
 */
class rmWebUI {
    constructor(config) {
        this.filesApiResponse = undefined;  /**< Response from backend/api/files.php */

        this.config = config;               /**< Configuration from config/config.php */
        this.pages = {
            register: new rmWebUIRegister(this),
            list: new rmWebUIList(this)
        };
    }

    /**
     * Initialize the interface based on the response from backend/api/files.php provided in argument
     *
     * @param filesApiResponse Response from backend/api/files.php
     */
    init(filesApiResponse) {
        this.filesApiResponse = filesApiResponse;

        this.show('loading-spinner', false);
        
        if(this.filesApiResponse["status"] === "error") {
            switch(this.filesApiResponse["errorType"]) {
            case "load-token":
                this.showPage("register");
                break;
            case "init-api":
                this.showError("Unable to connect to the cloud! You may try to register again.", this.filesApiResponse["error"]);
                this.showPage("register");
                break;
            case "retrieve-files":
                this.showError("Unable to retrieve file list from the cloud!", this.filesApiResponse["error"]);
                this.showPage(""); // hide all pages
                break;
            default:
                this.showError("Unknown error (" + this.filesApiResponse["errorType"] + ")", this.filesApiResponse["error"]);
                this.showPage(""); // hide all pages
            }
        } else {
            this.pages.list.buildFileTable();
            this.showPage("list");
        }
    }

    /**
     * Show/Hide an element
     *
     * @param id ID
     * @param visible Visibility
     */
    show(id, visible) {
        const cl = document.getElementById(id).classList;
        if(cl.contains('d-none') && visible == true) cl.remove('d-none');
        else if(!cl.contains('d-none') && visible == false) cl.add('d-none');
    }

    /**
     * Display an error
     *
     * @param error Error message
     * @param extended_error_text Details
     */
    showError(error, extended_error_text) {
        document.getElementById('error-text').innerHTML = error != null ? error : "";
        document.getElementById('extended-error-text').innerHTML = extended_error_text;
        this.show('error-banner', error != null)
    }

    /**
     * Show a page (hide all others)
     *
     * @param page list or register
     */
    showPage(page) {
        for(const item of ["register", "list"]) {
            this.show("content-"+item, item == page);
        };
    }

    /**
     * API request
     *
     * @param request API Request URL
     * @param handler Response handler
     * @param finallyHandler Callback to be called at the end, regardless of success state
     */
    apiRequest(request, handler, finallyHandler) {
        const httpRequest = new XMLHttpRequest();
        httpRequest.open("GET", request, true);
        httpRequest.responseType = "arraybuffer";
        httpRequest.send();
        this.show('loading-spinner', true);
        const ui = this;
        httpRequest.addEventListener("error", function() {
            ui.showError("Cannot contact backend", "XMLHttpRequest error.");
            ui.show('loading-spinner', false);
            finallyHandler();
        });
        httpRequest.addEventListener("readystatechange", function() {
            if (this.readyState === this.DONE) {
                ui.show('error-banner', false);
                try {
                    const json = JSON.parse(new TextDecoder().decode(this.response));
                    handler(json);
                } catch(e) {
                    handler(this.response);
                }
                ui.show('loading-spinner', false);
                finallyHandler();
            }
        });
    }

    /**
     * Get file list and update UI
     */
    getFiles() {
        const ui = this;
        ui.apiRequest("backend/api/files.php", function(response) {
            try {
                ui.init(response);
            } catch(e) {
                ui.showError("Invalid response from the cloud API.", e.message);
            }
        }, function() {});
    }

    /**
     * Get supported format
     *
     * @return List of formats
     */
    getFormats() {
        if(this.config.rmrl.trim() == "") {
            return ["zip"];
        } else {
            return ["pdf", "zip"];
        }
    }
}
