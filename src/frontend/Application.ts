/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE file)
 *
 *****************************************************/

import { Config } from './Config';
import { RegisterPage } from './RegisterPage';

import { APIResponse, isAPIResponse, APIResponseStatus } from '../backend/APITypes';
import { CloudAPIResponseError } from '../backend/CloudAPITypes';

interface PageList {
    register: RegisterPage;
    list: RegisterPage; // todo
}

/**
 * Main class for the JavaScript logic of the website
 */
export class Application {
    readonly config: Config;

    protected filesApiResponse: APIResponse|undefined = undefined;
    protected nRequests = 0;
    protected refreshButtonVisible = false;
    protected resizeInterval: ReturnType<typeof setTimeout>|undefined = undefined;
    
    protected pages : PageList = {
        register: new RegisterPage(this),
        list: new RegisterPage(this)
    };
    
    constructor(config: Config) {
        this.config = config;
        this.setTitle();
        this.setFooter();
        this.show('demo-banner', this.config.demo);

        // set events for collapsibles to resize the margin for the header during show/hide animation
        Array.prototype.forEach.call(document.getElementsByClassName('collapse'), (coll) => {
            coll.addEventListener('hide.bs.collapse', this.setResizeInterval.bind(this));
            coll.addEventListener('hidden.bs.collapse', this.clearResizeInterval.bind(this));

            coll.addEventListener('show.bs.collapse', this.setResizeInterval.bind(this));
            coll.addEventListener('shown.bs.collapse', this.clearResizeInterval.bind(this));
        });

        this.getFiles();
    }
    
    /**
     * Clear the resizing interval used to follow collapse animation
     */
    public clearResizeInterval(): void {
        if(this.resizeInterval) {
            clearInterval(this.resizeInterval);
            this.resizeInterval = undefined;
        }
    }

    /**
     * Set the resizing interval to follow collapse animation
     */
    public setResizeInterval(): void {
        this.resizeInterval = setInterval(() => this.resizeHeader(), 25);
        // we clear the interval after a time just in case the hidden/shown events
        // are not received (we don't want to run this interval forever)
        setTimeout(() => this.clearResizeInterval(), 2000);
    }
 
    /**
     * Refresh the interface based on the response from ../backend/api/files.php provided in argument
     */
    refresh(): void {
        this.show('loading-spinner', false);
        if(this.filesApiResponse && this.filesApiResponse.status === APIResponseStatus.Error) {
            switch(this.filesApiResponse.errorType as CloudAPIResponseError) {
                case CloudAPIResponseError.LoadToken:
                    this.showPage("register");
                    break;
                case CloudAPIResponseError.InitAPI:
                    this.showError("Unable to connect to the cloud! You may try to register again.", this.filesApiResponse.error ? this.filesApiResponse.error : "Unknown error");
                    this.showPage("register");
                    break;
                case CloudAPIResponseError.RetrieveFiles:
                    this.showError("Unable to retrieve file list from the cloud!", this.filesApiResponse.error ? this.filesApiResponse.error : "Unknown error");
                    this.showPage(""); // hide all pages
                    break;
                default:
                    this.showError("Unknown error (" + this.filesApiResponse["errorType"] + ")", this.filesApiResponse.error ? this.filesApiResponse.error : "Unknown error");
                    this.showPage(""); // hide all pages
            }
        } else {
            this.showPage("list");
        }
        this.resizeHeader();
    }

    /** 
     * Resize the margin for the header 
     */
    public resizeHeader(): void {
        const body = document.getElementsByTagName("body")[0];
        const height = document.getElementById('header')?.getBoundingClientRect().height;
        if(!height) return;
        body.style.setProperty('padding-top', ''+Math.round(height)+'px');
    }

    /**
     * Get full application name (name, version, demo)
     *
     * @param nbsp Use &nbsp; if true
     * @return full name
     */
    public getAppName(nbsp: boolean): string {
        const name = this.config.name + " " + this.config.version;
        if(nbsp) return name.replace(/\s/g, "&nbsp;");
        else return name;
    }

    /**
     * Show refresh button
     */
    public showRefresh(show: boolean): void {
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
    public setTitle(path:string|false = false): void {
        const titletext = document.getElementById('title-text');
        if(titletext == null) return;
        
        if(!path) {
            titletext.innerHTML = this.getAppName(true);
            document.title = this.getAppName(false);
        } else {
            titletext.innerHTML = path;
            document.title = path + ' - ' + this.getAppName(false);
        }

        if(this.config.demo) {
            titletext.innerHTML += '&nbsp;<span class="badge rounded-pill bg-dark text-white">DEMO</span>';
            document.title += ' [DEMO]';
        }
        this.resizeHeader();
    }

    /**
     * Set footer
     */
    public setFooter(): void {
        const footer = document.getElementById('footer-text');
        if(footer)
            footer.innerHTML = this.getAppName(true) + (this.config.demo ? ' <span class="badge rounded-pill bg-light text-black">DEMO</span>' : "");
    }

    /**
     * Show/Hide an element
     *
     * @param id ID
     * @param visible Visibility
     */
    public show(id: string, visible: boolean): void {
        const cl = document.getElementById(id)?.classList;
        if(cl) {
            if(cl.contains('d-none') && visible) cl.remove('d-none');
            else if(!cl.contains('d-none') && visible) cl.add('d-none');
            this.resizeHeader();
        }
    }

    /**
     * Display an error
     *
     * @param error Error message
     * @param extended_error_text Details
     */
    public showError(error: string, extended_error_text: string): void {
        const errorText = document.getElementById('error-text');
        if(errorText instanceof HTMLElement) errorText.innerHTML = error;

        const extended = document.getElementById('extended-error-text');
        if(extended instanceof HTMLElement) extended.innerHTML = extended_error_text;

        this.show('error-banner', true);
    }

    /**
     * Show a page (hide all others)
     *
     * @param page list or register
     */
    public showPage(page: ""|keyof PageList): void {
        for(const item in this.pages) {
            this.show("content-"+item, item == page);
        }
        if(page != "" && this.pages[page].showPage) this.pages[page].showPage();
        this.resizeHeader();
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
    public apiRequest(request: string, jsonOnly: boolean, handler: (resp:APIResponse|Buffer)=>void, finallyHandler: ()=>void): Promise<void> {
        return new Promise<void>((resolve, reject) => {
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
                        json = JSON.parse(new TextDecoder().decode(httpRequest.response)) as APIResponse;
                        success = true;
                        handler(json);
                    } catch(e) {
                        if(!jsonOnly) {
                            success = true;
                            handler(httpRequest.response);
                        } else {
                            this.showError("Unable to load "+request, e instanceof Error  ? e.message : "Unkown error");
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
    public getFiles(): void {
        this.apiRequest("/cloud/files?sessionId="+this.config.sessionId, true, (response) => {
            if(isAPIResponse(response)) 
                this.filesApiResponse = response;
        }, () => {
            this.refresh();
        });
    }
}
