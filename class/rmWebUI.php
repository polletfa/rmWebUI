<?php
/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE file)
 *
 *****************************************************/

namespace digitalis\rmWebUI;

use splitbrain\RemarkableAPI\RemarkableAPI;
use splitbrain\RemarkableAPI\RemarkableFS;

use Psr\Log\NullLogger;

require_once("Data.php");
use digitalis\rmWebUI\Data;

/**
 * Main class
 */
class rmWebUI {
    /**
     * Data from URL, session and configuration
     */
    protected $data;
    /**
     * Mode (debug or prod)
     */
    protected $mode;
    /**
     * rmrl command
     */
    protected $rmrl;
    
    /**
     * Constructor
     *
     * @param mode Mode (debug or prod)
     * @param rmrl Rmrl command
     */
    function __construct($mode, $rmrl) {
        $this->mode = $mode;
        $this->rmrl = $rmrl;
        $this->data = new Data();
    }

    /**
     * Find an item in the reMarkable cloud by UUID (the file list must already be loaded)
     *
     * @param id UUID
     * @return Array [path, item]
     */
    protected function findItem($id) {
        foreach($this->data->tree as $path => $items) {
            foreach($items as $item) {
                if($item['ID'] == $id) {
                    return [$path, $item];
                }
            }
        }
        return ["/", null];
    }

    /**
     * Return a string with onclick, onmouseover and onmouseout - Used to convert any HTML element into a link
     *
     * @param url Target URL (href)
     * @return String with definitions for onclick, onmouseover and onmouseout events
     */
    protected function falseLink($url) {
        return " onclick=\"window.location.href = '".$url."'\" onmouseover=\"document.body.style.cursor = 'pointer'\" onmouseout=\"document.body.style.cursor = 'auto'\" ";
    }

    /**
     * Add a line to the debug-div (debug mode only)
     *
     * @param text Text to add
     */
    protected function writeToDebugDiv($text) {
        if($this->mode != "prod") {
            ?><script>document.getElementById('debug-div').innerHTML += "<?php echo $text ?><br/>";</script><?php
        }
    }

    /**
     * Initialize API
     * The token must already be loaded.
     *
     * @return API object
     */
    protected function initAPI() {
        $this->writeToDebugDiv("Initialize the reMarkable Cloud API...");
        $api = new RemarkableAPI(null); // todo implement logger
        $api->init($this->data->token);
        return $api;
    }

    /**
     * List items of a specific type (either collection or document) for the current collection
     *
     * @param type CollectionType or DocumentType
     * @return String containing a list of tr-elements
     */
    protected function listItemsOfType($type) {
        foreach($this->data->tree as $path => $items) {
            foreach($items as $item) {
                if($item['Parent'] == $this->data->collection && $item['Type'] == $type) {
                    $link = "";
                    $icon = "";
                    if($type == "CollectionType") {
                        $link = "?collection=".$item['ID'];
                        $icon = "folder";
                    } else {
                        $link = "?download=".$item['ID'];
                        $icon = "file";
                    }
                    echo "<tr><td ".$this->falseLink($link).">";
                    echo "<img src=\"svg/".$icon.".svg\" />&nbsp;&nbsp;";
                    echo $item["VissibleName"];
                    echo "</td></tr>";
                }
            }
        }
    }

    /**
     * Generate the "list" page
     */
    protected function list() {
        if($this->data->tree == null) {
            $api = $this->initAPI();
            
            $this->writeToDebugDiv("Retrieve file list from the reMarkable Cloud...");
            $fs = new RemarkableFS($api);
            $this->data->tree = $fs->getTree();
        }

        [$currentPath,$currentItem] = $this->findItem($this->data->collection);

        ?>
        <div class="row"><div class="col h1"><?php echo $currentPath; ?></div><div class="col d-flex align-items-center justify-content-end"><a href="?collection=<?php echo $this->data->collection ;?>&refresh"><img src="svg/refresh.svg"/></a></div></div>
        <div class="row">                                                       
        <table class="table table-hover"><tbody><?php
                                                             
        if($this->data->collection != "") {
            ?><tr><td <?php echo $this->falseLink("?collection=".$currentItem['Parent']) ?>><img src="svg/folder.svg"/>&nbsp;&nbsp;..</td></tr><?php
        }
        $this->listItemsOfType("CollectionType");
        $this->listItemsOfType("DocumentType");

        ?></tbody></table></div>
        <?php
    }

    /**
     * Download file
     */
    protected function download() {
        $this->mode = "prod"; // no debug messages while downloading

        // get filename
        [$path,$item] = $this->findItem($this->data->download);
        $filename = preg_replace('/[^A-Za-z0-9\-_]/', '', str_replace(' ', '_', $item["VissibleName"]));

        // HTTP header
        $filetype = $this->rmrl == null || $this->rmrl == "" ? "zip" : "pdf";
        header('Content-Type:application/' . $filetype);
        header('Content-Disposition:attachment;filename='.$filename.'.'.$filetype);

        // Get file
        $api = $this->initAPI();
        $filecontent = $api->downloadDocument($this->data->download)->getBody();

        if($filetype == 'pdf') {
            // Convert with rmrl
            $tmpfile = "/tmp/".$this->data->download.".zip";
            file_put_contents($tmpfile, $filecontent);
            passthru($this->rmrl." ".$tmpfile . " 2>&1");
        } else {
            // write original ZIP file (no conversion to PDF)
            echo $filecontent;
        }
    }

    /**
     * Run the WebUI
     */
    public function run() {
        if($this->data->token != "" && $this->data->download != "") {
            $this->download();
        } else {
            ?><html>
                <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">

                <link href="css/bootstrap.min.css" rel="stylesheet">

                </head>
                <body>
                <div class="container-fluid">
                <?php
            
                if($this->mode != "prod") {
                    ?><div class="row bg-warning"><div class="col text-center" id="debug-div">Debug mode enabled.<br/></div></div><?php
                }
            ?><?php
                if($this->data->token == "") {
                    // no token -> register
                    // todo register page
                } else {
                    $this->list();
                }
            ?></div>
            <div class="row bg-dark fixed-bottom text-white"><div class="col">&copy; 2021-2022 Fabien Pollet &lt;polletfa@posteo.de&gt;</div><div class="col text-end">rmWebUI 0.1.0</div></div>
            </body></html><?php
        }                                                       
    }
}

?>
