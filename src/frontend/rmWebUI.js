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
    constructor() {
        this.filesApiResponse = undefined;  /**< Response from ../backend/api/files.php */
        this.version = undefined;           /**< Name and version */
        this.config = undefined;            /**< Configuration */
        this.pages = {                      /**< List of pages */
            register: new rmWebUIRegister(this),
            list: new rmWebUIList(this)
        };
    
        // Load config, version and pages
        const loading = [
            this.apiRequest("../version.json", true, response => {
                this.version = response;
                this.setTitle();
                this.setFooter();
            }, () => {}),
            this.apiRequest("../data/config.json", true, response => {
                this.config = response;
                this.show("debug-banner", this.config.mode === "debug");
            }, () => {})
        ];
        for(const page in this.pages) {
            loading.push(this.loadPage(page));
        }
        Promise.all(loading).then(() => {
            // Load data from the cloud
            this.getFiles();       
        });
    }

    /**
     * Refresh the interface based on the response from ../backend/api/files.php provided in argument
     */
    refresh() {
        this.show('loading-spinner', false);
        
        if(this.filesApiResponse["status"] === "error") {
            switch(this.filesApiResponse["errorType"]) {
            case "load-token":
                this.showPage("register");
                this.setTitle();
                break;
            case "init-api":
                this.showError("Unable to connect to the cloud! You may try to register again.", this.filesApiResponse["error"]);
                this.showPage("register");
                this.setTitle();
                break;
            case "retrieve-files":
                this.showError("Unable to retrieve file list from the cloud!", this.filesApiResponse["error"]);
                this.showPage(""); // hide all pages
                this.setTitle();
                break;
            default:
                this.showError("Unknown error (" + this.filesApiResponse["errorType"] + ")", this.filesApiResponse["error"]);
                this.showPage(""); // hide all pages
                this.setTitle();
            }
        } else {
            this.pages.list.buildFileTable();
            this.showPage("list");
        }
    }

    /**
     * Get full application name (name, version, demo)
     *
     * @param nbsp Use &nbsp; if true
     * @return full name
     */
    getAppName(nbsp) {
        const name = this.version.name + " " + this.version.version
            +(this.version.demo == true ? (" " + " [demo]") : "");
        if(nbsp) return name.replaceAll(" ", "&nbsp;");
        else return name;
    }
    
    /**
     * Set title
     *
     * @param path Path to display or false for standard title
     */
    setTitle(path = false) {
        if(path == false) {
            document.getElementById('title-text').innerHTML = this.getAppName(true);
            document.title = this.getAppName(false);
        } else {
            document.getElementById('title-text').innerHTML = path;
            document.title = path + ' ' + this.getAppName(false);
        }
    }

    /**
     * Set footer
     */
    setFooter() {
        document.getElementById('footer-text').innerHTML = this.getAppName(true);
    }

    /**
     * Load a page
     *
     * @param name Page name
     * @return Promise
     */
    loadPage(name) {
        // add div for page
        const page = document.createElement("div");
        page.classList.add("d-none");
        const pageid = document.createAttribute("id");
        pageid.value = "content-"+name;
        page.setAttributeNode(pageid);
        document.getElementById("content").appendChild(page);
        
        // load file
        return this.apiRequest("pages/"+name+".html", false, (response) => {
            page.innerHTML = (new TextDecoder).decode(response);
        }, () => {});
    }

    /**
     * Show/Hide an element
     *
     * @param id ID
     * @param visible Visibility
     * @return previous visibility
     */
    show(id, visible) {
        const cl = document.getElementById(id).classList;
        const prev = !cl.contains('d-none');
        if(cl.contains('d-none') && visible == true) cl.remove('d-none');
        else if(!cl.contains('d-none') && visible == false) cl.add('d-none');
        return prev;
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
     * @param jsonOnly accept JSON only
     * @param handler Response handler
     * @param finallyHandler Callback to be called at the end, regardless of success state
     * @return Promise
     */
    apiRequest(request, jsonOnly, handler, finallyHandler) {
        return new Promise((resolve, reject) => {
            const httpRequest = new XMLHttpRequest();
            httpRequest.open("GET", request, true);
            httpRequest.responseType = "arraybuffer";
            httpRequest.send();
            this.show('loading-spinner', true);
            const refreshBtnPrev = this.show('refresh-button', false);
            httpRequest.addEventListener("error", () => {
                this.showError("Unable to load "+request, "XMLHttpRequest error.");
                this.show('loading-spinner', false);
                this.show('refresh-button', refreshBtnPrev);
                finallyHandler();
                reject();
            });
            httpRequest.addEventListener("readystatechange", () => {
                if (httpRequest.readyState === httpRequest.DONE) {
                    this.show('error-banner', false);
                    let json = undefined;
                    let success = false;
                    try {
                        json = JSON.parse(new TextDecoder().decode(httpRequest.response));
                        success = true;
                        handler(json);
                    } catch(e) {
                        if(!jsonOnly) {
                            success = true;
                            handler(httpRequest.response);
                        } else {
                            this.showError("Unable to load "+request, e.message);
                        }                            
                    }
                    this.show('loading-spinner', false);
                    this.show('refresh-button', refreshBtnPrev);
                    finallyHandler();
                    if(success) resolve();
                    else reject();
                }
            });
        });
    }

    /**
     * Get file list and update UI
     */
    getFiles() {
        this.apiRequest("../backend/api/files.php", true, (response) => {
            this.filesApiResponse = response;
        }, () => {
            this.refresh();
        });
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
