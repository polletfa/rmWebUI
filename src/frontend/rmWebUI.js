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
        this.pages = {};                    /**< List of pages */

        this.nRequests = 0;
        this.refreshButtonVisible = false;
        
        // Load config and version
        Promise.all([
            this.apiRequest("../version.json", true, response => {
                this.version = response;
                this.setTitle();
                this.setFooter();
                this.show('demo-banner', this.version.demo);
            }, () => {}),
            this.apiRequest("../data/config.json", true, response => {
                this.config = response;
                this.show("debug-banner", this.config.mode === "debug");
            }, () => {})
        ]).then(() => {       
            // Intialize and load pages
            const loading = [];
            Array.prototype.forEach.call(document.getElementsByClassName('rmWebUI-page'), (page)=>{
                const pagename = page.getAttribute("data-rmWebUI-page");
                const classname = page.getAttribute("data-rmWebUI-class");
                
                if(pagename && classname) {
                    page.setAttribute("id", "content-" + pagename);
                    if(!page.classList.contains("d-none")) page.classList.add("d-none");

                    // load html
                    loading.push(this.apiRequest("pages/"+pagename+".html", false, (response) => {
                        document.getElementById("content-"+pagename).innerHTML = (new TextDecoder).decode(response);
                    }, () => {}));

                    // load script
                    loading.push(new Promise((resolve) => {
                        const script = document.createElement("script");
                        script.src = "pages/"+pagename+".js";
                        script.addEventListener("load", () => {
                            this.pages[pagename] = (Function('ui', 'return new '+classname+'(ui)'))(this);
                            resolve();
                        });
                        script.addEventListener("error", () => {
                            resolve();
                        });
                        document.body.appendChild(script);
                    }));
                }
            });
            
            Promise.all(loading).then(() => {
                // Load data from the cloud
                this.getFiles();       
            });
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
        const name = this.version.name + " " + this.version.version;
        if(nbsp) return name.replaceAll(" ", "&nbsp;");
        else return name;
    }

    /**
     * Show refresh button
     */
    showRefresh(show) {
        this.refreshButtonVisible = show;
        if(this.nRequests == 0) {
            this.show("refresh-button", show);
        }
    }
    
    /**
     * Set title
     *
     * @param path Path to display or false for standard title
     */
    setTitle(path = false) {
        const titletext = document.getElementById('title-text');
        if(path == false) {
            titletext.innerHTML = this.getAppName(true);
            document.title = this.getAppName(false);
        } else {
            titletext.innerHTML = path;
            document.title = path + ' - ' + this.getAppName(false);
        }

        if(this.version.demo) {
            titletext.innerHTML += '&nbsp;<span class="badge rounded-pill bg-dark text-white">DEMO</span>';
            document.title += ' [DEMO]';
        }
    }

    /**
     * Set footer
     */
    setFooter() {
        document.getElementById('footer-text').innerHTML = this.getAppName(true)
            + (this.version.demo ? ' <span class="badge rounded-pill bg-light text-black">DEMO</span>' : "");
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
        for(const item in this.pages) {
            this.show("content-"+item, item == page);
        };
        if(this.pages[page].showPage) this.pages[page].showPage();
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
            this.nRequests ++;
            httpRequest.open("GET", request, true);
            httpRequest.responseType = "arraybuffer";
            httpRequest.send();
            this.show('loading-spinner', true);
            this.show('refresh-button', false);
            httpRequest.addEventListener("error", () => {
                this.nRequests = this.nRequests > 0 ? this.nRequests -1 : 0;
                this.showError("Unable to load "+request, "XMLHttpRequest error.");

                this.show('loading-spinner', this.nRequests > 0);
                this.show('refresh-button', this.nRequests == 0 && this.refreshButtonVisible);
                finallyHandler();
                reject();
            });
            httpRequest.addEventListener("readystatechange", () => {
                if (httpRequest.readyState === httpRequest.DONE) {
                    this.nRequests = this.nRequests > 0 ? this.nRequests-1 : 0;
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
                    this.show('loading-spinner', this.nRequests > 0);
                    this.show('refresh-button', this.nRequests == 0 && this.refreshButtonVisible);
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
