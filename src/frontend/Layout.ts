/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import { Application, PageList } from './Application';
import { APIRequest } from './APIRequest';

/**
 * Class for managing/modifying the layout
 */
export class Layout {
    protected ui: Application;
 
    protected refreshButtonVisible = false;      /**< Specify if the refresh button is active for the current page */
    protected resizeInterval:ReturnType<typeof setTimeout>|undefined = undefined; /**< @see setResizeInterval */
    protected title: string;
    
    /**
     * @param ui Main object of the Application
     */
    constructor(ui: Application) {
        this.ui = ui;
        this.title = document.title;

        this.show('demo-badge-header', this.ui.config.demo);
        this.show('demo-badge-footer', this.ui.config.demo);
        this.show('demo-banner', this.ui.config.demo);
        const el = document.getElementById("demo-register-code");
        if(el instanceof HTMLElement) el.innerHTML = this.ui.config.register;
        
        // set events for collapsibles to resize the margin for the header during show/hide animation
        Array.prototype.forEach.call(document.getElementsByClassName('collapse'), (coll) => {
            coll.addEventListener('hide.bs.collapse', this.setResizeInterval.bind(this));
            coll.addEventListener('hidden.bs.collapse', this.clearResizeInterval.bind(this));

            coll.addEventListener('show.bs.collapse', this.setResizeInterval.bind(this));
            coll.addEventListener('shown.bs.collapse', this.clearResizeInterval.bind(this));
        });
    }

    /**
     * Return the visibility of the refresh button.
     * The button may be currently hidden even if the visibility is true (for example while waiting for an API request to finish)
     */
    public isRefreshButtonVisible(): boolean { return this.refreshButtonVisible; }

    /**
     * Get an icon
     *
     * @param name short name of the icon
     * @return Icon SVG code
     */
    public getIcon(name: string): string {
        const el = document.getElementById("icon-"+name);
        if(el instanceof HTMLElement) return el.innerHTML;
        else return "";
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
     *
     * When a collapsible element is displayed/hidden, we resize the header periodically to "follow" the collapse/expand animation
     */
    public setResizeInterval(): void {
        this.resizeInterval = setInterval(() => this.resizeHeader(), 25);
        // we clear the interval after a time just in case the hidden/shown events
        // are not received (we don't want to run this interval forever)
        setTimeout(() => this.clearResizeInterval(), 2000);
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
     * Show refresh button
     */
    public showRefresh(show: boolean): void {
        this.refreshButtonVisible = show;
        if(APIRequest.getActiveRequests() == 0) {
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
            titletext.innerHTML = this.title;
            document.title = this.title.replace(/&nbsp;/g, " ");
        } else {
            titletext.innerHTML = path;
            document.title = path + ' - ' + this.title.replace(/&nbsp;/g, "");
        }

        if(this.ui.config.demo) {
            document.title += ' [DEMO]';
        }
        this.resizeHeader();
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
            else if(!cl.contains('d-none') && !visible) cl.add('d-none');
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
        if(extended instanceof HTMLElement) extended.innerHTML = this.escapeHTML(extended_error_text);

        this.show('error-banner', true);
    }

    /**
     * Show a page (hide all others)
     *
     * @param page list or register
     */
    public showPage(page: ""|keyof PageList): void {
        for(const item in this.ui.pages) {
            this.show("content-"+item, item == page);
        }
        if(page != "" && this.ui.pages[page].showPage) this.ui.pages[page].showPage();
        this.resizeHeader();
    }

    /**
     * Escape HTML special characters
     *
     * @param str Input string
     * @return Escaped string
     */
    protected escapeHTML(str: string): string {
        return str.replace(
            /[&<>'"]/g,
            tag =>
                ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;'
                }[tag] || tag)
        );
    }
}
