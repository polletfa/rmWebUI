<?php
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
     * Constructor
     *
     * @param mode Mode (debug or prod)
     */
    function __construct($mode) {
        $this->mode = $mode;
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
        return "onclick=\"window.location.href = '".$url."'\" onmouseover=\"document.body.style.cursor = 'pointer'\" onmouseout=\"document.body.style.cursor = 'auto'\"";
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
                        $link = ""; // todo download and convert file
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
     * Generate the "list" page
     */
    protected function list() {
        if($this->data->tree == null) {
            $this->writeToDebugDiv("Initialize the reMarkable Cloud API...");
            $api = new RemarkableAPI(null); // todo implement logger
            $api->init($this->data->token);

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
     * Run the WebUI
     */
    public function run() {
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
        ?></div></body></html><?php
    }
}

?>
