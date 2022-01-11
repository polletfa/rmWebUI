/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import { Application } from "./Application";
import { IPage } from "./IPage";
import { APIRequest } from './APIRequest';

import { isAPIResponse } from "../backend/APITypes";
import { isCloudAPIResponseDataFiles } from "../backend/CloudAPITypes";

/**
 * Page "list"
 */
export class ListPage extends IPage {
    protected collection = ""; /**< ID of the currently displayed collection */

    constructor(ui: Application) {
        super(ui);
    }

    /**
     * Method called when the page is shown
     */
    public showPage(): void {
        if(!isAPIResponse(this.ui.filesApiResponse)) return;
        if(!isCloudAPIResponseDataFiles(this.ui.filesApiResponse.data)) return;

        const thisEntry = this.ui.filesApiResponse.data.files.find(item => item.id === this.collection);
        
        let html = "";

        // entry ".."
        if(thisEntry && this.collection != "") {
            html += this.collectionEntry(thisEntry.parent, "..");
        }
        
        // collections
        for(const item of this.ui.filesApiResponse.data.files) {
            if(item.parent === this.collection && item.type === "CollectionType") {
                html += this.collectionEntry(item.id, item.name);
            }
        }
        // documents
        for(const item of this.ui.filesApiResponse.data.files) {
            if(item.parent === this.collection && item.type === "DocumentType") {
                html += this.documentEntry(item.id, item.version, item.name);
            }
        }

        // update page
        this.ui.layout.setTitle(thisEntry ? thisEntry.path : "/");
        this.ui.layout.showRefresh(true);
        this.ui.layout.show('error-banner', false);
        const filestable = document.getElementById('files-table');
        if(filestable instanceof HTMLElement) filestable.innerHTML = html;
    }

    /**
     * Helper function: returns onmouseover and onmouseout to simulate a link
     *
     * @return String
     */
    protected setMouseBehaviour(): string {
        return ' onmouseover="document.body.style.cursor = \'pointer\';"'
            + ' onmouseout="document.body.style.cursor = \'auto\';" ';
    }

    /**
     * HTML for a collection entry
     *
     * @param id Collection ID
     * @param name Collection name
     * @return HTML as string
     */
    protected collectionEntry(id: string, name: string) {
        return '<tr>'
            + '<td ' + this.setMouseBehaviour()
            + ' onclick="window.application.pages.list.openCollection(\''+id+'\')">'
            + this.ui.layout.getIcon("folder")
            + '&nbsp;&nbsp;'
            + name
            + '</td></tr>';
    }

    /**
     * HTML for a collection entry
     *
     * @param id Document ID
     * @param version Document version
     * @param name Document name
     * @return HTML as string
     */
    protected documentEntry(id: string, version: number, name: string): string {
        let html = '<tr>'
            + '<td '+this.setMouseBehaviour()
            + ' onclick="window.application.pages.list.toggleDownloadMenu(\''+id+'\');">'
            + this.ui.layout.getIcon("file")
            + '&nbsp;&nbsp;'
            + name
            + '</td></tr>';

        for(const format of this.ui.config.formats) {
            html += '<tr id="'+format+'-'+id+'" class="d-none download-menu-item">'
                +'<td '+this.setMouseBehaviour()
                +' onclick="window.application.pages.list.download(\''+id+'\',\''+version+'\',\''+format+'\');">'
                +this.ui.layout.getIcon("empty")
                +'&nbsp;&nbsp;'
                +this.ui.layout.getIcon("download")
                +'&nbsp;&nbsp;'
                +'Download as '+format.toUpperCase()
                +'</td></tr>';
        }

        return html;
    }

    /**
     * Change current collection
     *
     * @param collection Collection ID
     */
    public openCollection(collection: string): void {
        this.collection = collection;
        this.showPage();
    }

    /**
     * Display/Hide the download menu for a document
     *
     * @param id Document ID
     */
    public toggleDownloadMenu(id: string): void {
        this.ui.config.formats.forEach((format) => {
            const el = document.getElementById(format + '-' + id);
            if(el instanceof HTMLElement) {
                if(el.classList.contains('d-none')) el.classList.remove('d-none');
                else el.classList.add('d-none');
            }
        });
        Array.prototype.forEach.call(document.getElementsByClassName('download-menu-item'), (menuitem)=>{
            if(!this.ui.config.formats.find(i => i+"-"+id == menuitem.id) &&!menuitem.classList.contains('d-none'))
                menuitem.classList.add('d-none');
        });
    }

    /**
     * Download a file
     *
     * @param id Document ID
     * @param version Document version (required to look in the cache, if the document is downloaded directly, the latest version will be download)
     * @param format File format
     */
    public download(id: string, version: number, format: string): void {
        if(!isAPIResponse(this.ui.filesApiResponse)) return;
        if(!isCloudAPIResponseDataFiles(this.ui.filesApiResponse.data)) return;

        const thisEntry = this.ui.filesApiResponse.data.files.find(item => item.id === id);
        if(!thisEntry) return;
        const filename = thisEntry.name.replace(/[^A-Za-z0-9-]/g, "_");
        new APIRequest(this.ui, "/cloud/download?sessionId="+this.ui.config.sessionId+"&id="+id+"&version="+version+"&format="+format)
            .onReceiveJSON((response) => {
                this.ui.layout.showError("Unable to download the file ("+response["errorType"]+").", response["error"] ? response["error"] : "Unkown error");
            })
            .onReceiveData((response) => {
                // create blob
                const url = URL.createObjectURL(new Blob([response], {type:"application/octet-stream"}));
                // create link
                const link = document.createElement("a");
                link.classList.add("d-none");
                link.setAttribute("href", url);
                link.setAttribute("download", filename+"."+format);
                link.click();
                
                setTimeout(() => {
                    // cleanup
                    link.remove();
                    window.URL.revokeObjectURL(url);
                }, 100);
            });
    }
}
