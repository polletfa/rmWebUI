<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

require_once __DIR__ . '/vendor/autoload.php';

use splitbrain\RemarkableAPI\RemarkableAPI;
use splitbrain\RemarkableAPI\RemarkableFS;

use Psr\Log\NullLogger;

class rmWebUI {
    const TOKEN_FILE = __DIR__ . '/auth.token';
    protected $api;
    protected $collection;

    protected function loadToken() {
        if (!file_exists(self::TOKEN_FILE)) throw new \Exception('No auth token available. Use register command');
        return file_get_contents(self::TOKEN_FILE);
    }

    protected function findItem($tree, $id) {
        foreach ($tree as $path => $items) {
            foreach ($items as $item) {
                if($item['ID'] == $id) {
                    return [$path, $item];
                }
            }
        }
        return ["/", null];
    }

    protected function listItemsOfType($tree, $type) {
        foreach ($tree as $path => $items) {
            foreach ($items as $item) {
                if($item['Parent'] == $this->collection && $item['Type'] == $type) {
                    echo "<tr><td>".(new \DateTime($item['ModifiedClient']))->format('Y-m-d H:i:s')."</td><td>";
                    if($type == "CollectionType") echo "<a href=\"?collection=".$item['ID']."\">";
                    echo $item["VissibleName"];
                    if($type == "CollectionType") echo "</a>";
                    echo "</td></tr>";
                }
            }
        }
    }
 
    public function init() {
        $this->collection = isset($_GET['collection']) ? $_GET['collection'] : "";
        $this->api = new RemarkableAPI(null); // todo implement logger
        if (file_exists(self::TOKEN_FILE)) {
            $this->api->init($this->loadToken());
        }
    }

    public function list() {
        $fs = new RemarkableFS($this->api);
        $tree = $fs->getTree();

        [$currentPath,$currentItem] = $this->findItem($tree, $this->collection);

        echo "<h1>".$currentPath."</h1>";
        echo "<table>";
        if($this->collection != "") 
            echo "<tr><td>&nbsp;</td><td><a href=\"?collection=".$currentItem['Parent']."\">..</a></td><td>&nbsp;</td><td>&nbsp;</td></tr>";
        $this->listItemsOfType($tree, "CollectionType");
        $this->listItemsOfType($tree, "DocumentType");
        echo "</table>";
    }
}

$webui = new rmWebUI();
$webui->init();
?><html><body><?php
$webui->list();
?></body></html>

