/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE file)
 *
 *****************************************************/

/**
 * Page "list files"
 */
class rmWebUIList {
    constructor(ui) {
        this.ui = ui;         /**< Main class */
        this.collection = ""; /**< Currently displayed collection */
    }

    /**
     * Build the table listing the files depending on the file list currently loaded
     */
    buildFileTable() {
        if(this.ui.filesApiResponse.files === undefined) return;

        const thisEntry = this.ui.filesApiResponse.files.find(item => item.ID === this.collection);
        
        let html = "";

        // entry ".."
        if(thisEntry && this.collection != "") {
            html += this.collectionEntry(thisEntry.Parent, "..");
        }
        
        // collections
        for(const item of this.ui.filesApiResponse.files) {
            if(item.Parent === this.collection && item.Type === "CollectionType") {
                html += this.collectionEntry(item.ID, item.Name);
            }
        }
        // documents
        for(const item of this.ui.filesApiResponse.files) {
            if(item.Parent === this.collection && item.Type === "DocumentType") {
                html += this.documentEntry(item.ID, item.Version, item.Name);
            }
        }

        // update page
        this.ui.setTitle(thisEntry ? thisEntry.Path : "/");
        this.ui.show('refresh-button', true);
        this.ui.show('error-banner', false);
        document.getElementById('files-table').innerHTML = html;
    }

    /**
     * Helper function: returns onmouseover and onmouseout to simulate a link
     *
     * @return String
     */
    setMouseBehaviour() {
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
    collectionEntry(id, name) {
        return '<tr>'
            + '<td ' + this.setMouseBehaviour()
            + ' onclick="app.pages.list.openCollection(\''+id+'\')">'
            + '<img src="resources/folder.svg"/>'
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
    documentEntry(id, version, name) {
        let html = '<tr>'
            + '<td '+this.setMouseBehaviour()
            + ' onclick="app.pages.list.toggleDownloadMenu(\''+id+'\');">'
            + '<img src="resources/file.svg"/>'
            + '&nbsp;&nbsp;'
            + name
            + '</td></tr>';

        for(const format of this.ui.getFormats()) {
            html += '<tr id="'+format+'-'+id+'" class="d-none download-menu-item">'
                +'<td '+this.setMouseBehaviour()
                +' onclick="app.pages.list.download(\''+id+'\',\''+version+'\',\''+format+'\');">'
                +'<img src="resources/empty.svg"/>'
                +'&nbsp;&nbsp;'
                +'<img src="resources/download.svg"/>'
                +'&nbsp;&nbsp;'
                +'Download as '+format.toUpperCase()
                +'</td></tr>'
        }

        return html;
    }

    /**
     * Change current collection
     *
     * @param collection Collection ID
     */
    openCollection(collection) {
        this.collection = collection;
        this.buildFileTable();
    }

    /**
     * Display/Hide the download menu for a document
     *
     * @param id Document ID
     */
    toggleDownloadMenu(id) {
        app.getFormats().forEach((format) => {
            let el = document.getElementById(format + '-' + id);
            if(el.classList.contains('d-none')) el.classList.remove('d-none');
            else el.classList.add('d-none');
        });
        Array.prototype.forEach.call(document.getElementsByClassName('download-menu-item'), (menuitem)=>{
            if(menuitem.id != 'zip-'+id && menuitem.id != 'pdf-'+id)
                if(!menuitem.classList.contains('d-none'))
                    menuitem.classList.add('d-none');
        });
    }

    /**
     * Download a file
     *
     * @param id Document ID
     * @param version Document version (required to look in the cache, if the document is downloaded directly, the latest version will be download)
     * @param format zip or pdf
     */
    download(id, version, format) {
        const thisEntry = this.ui.filesApiResponse.files.find(item => item.ID === id);
        const filename = thisEntry.Name.replaceAll(/[^A-Za-z0-9\-]/g, "_");
        this.ui.apiRequest("../backend/api/download.php?id="+id+"&version="+version+"&format="+format, false, (response) => {
            if(("status" in response) && response["status"] !== "success") {
                this.ui.showError("Unable to download the file ("+response["errorType"]+").", response["error"]);
            } else {
                // create blob
                const url = URL.createObjectURL(new Blob([response], {type:"application/octet-stream"}));
                // create link
                const link = document.createElement("a");
                link.classList.add("d-none");
                const href = document.createAttribute("href");
                href.value = url;
                link.setAttributeNode(href);
                const download = document.createAttribute("download");
                download.value = filename+"."+format;
                link.setAttributeNode(download);
                link.click();
                
                setTimeout(() => {
                    // cleanup
                    link.remove();
                    window.URL.revokeObjectURL(url);
                }, 100);
            }
        }, function() {});
    }
}
