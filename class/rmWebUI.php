<?php
/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE file)
 *
 *****************************************************/

/*
 * TODO:
 * - Cache generated PDFs for quicker access
 * - Use a logger for the RemarkableAPI class
 * - Better error handling?
 * - Implement upload?
 * - Internationalization
 */

namespace digitalis\rmWebUI;

use splitbrain\RemarkableAPI\RemarkableAPI;
use splitbrain\RemarkableAPI\RemarkableFS;

use Psr\Log\NullLogger;

require_once("Data.php");
use digitalis\rmWebUI\Data;

require_once("HTMLBuilder.php");
use digitalis\rmWebUI\HTMLBuilder as html;

/**
 * Main class
 */
class rmWebUI {
    /**
     * Program name
     */
    const NAME = "rmWebUI";

    /**
     * Version
     */
    const VERSION = "0.2.0";
    
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

    /*****************************************/
    /* Helpers */
    /*****************************************/
    
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
     * Add a line to the debug-div (debug mode only)
     *
     * @param text Text to add
     */
    protected function writeToDebugDiv($text) {
        if($this->mode != "prod") {
            html::SCRIPT([], function() use ($text) {
                echo("document.getElementById('debug-div').innerHTML += '".str_replace("'", "\\'", $text)."<br/>';");
            });
        }
    }

    /*****************************************/
    /* List files */
    /*****************************************/

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
                    // write line with icon + item name
                    html::TR([], function() use ($type,$item) {
                        html::TD(html::asLink("?" . ($type == "CollectionType" ? "collection" : "download") . "=" . $item["ID"]),
                        function() use ($type,$item) {
                            html::icon($type == "CollectionType" ? "folder" : "file");
                            html::nbsp(2);
                            html::text($item["VissibleName"]);
                        });
                    });
                }
            }
        }
    }

    /**
     * Generate the "list" page
     */
    protected function list() {
        if($this->data->tree == null) {
            try {
                $api = $this->initAPI();
            } catch(\Exception $e) {
                // cloud API error
                html::DIV(array("class" => "row"), function() {
                    html::DIV(array("class" => "col h1"), self::NAME . " " . self::VERSION);
                });
                $this->writeToDebugDiv("Unable to connect to the cloud!");
                html::DIV(array("class" => "alert alert-danger", "role" => "alert"), function() use ($e) {
                    html::P([], function() {
                        html::text("Unable to connect to the cloud! You may try to ");
                            html::A(array("href" => "?unregister"), "clear the access token");
                            html::text(" and register the application again.");
                        });
                    html::P([], $e->getMessage());
                });
                return;
            }
            $this->writeToDebugDiv("Retrieve file list from the reMarkable Cloud...");
            $fs = new RemarkableFS($api);
            $this->data->tree = $fs->getTree();
        }

        [$currentPath,$currentItem] = $this->findItem($this->data->collection);

        // write title line (collection + refresh button)
        html::DIV(array("class" => "row"), function() use ($currentPath) {
            html::DIV(array("class" => "col h1"), $currentPath);
            html::DIV(array("class" => "col col-sm-1 d-flex align-items-center justify-content-end"), function() {
                html::A(array("href" => "?collection=" . $this->data->collection . "&refresh"), function() {
                    html::icon("refresh");
                });
            });
        });

        // write table
        html::DIV(array("class" => "row"), function() use ($currentItem) {
            html::TABLE(array("class" => "table table-hover"), function() use ($currentItem) {
                html::TBODY([], function() use ($currentItem) {
                    // Parent collection when applicable
                    if($this->data->collection != "") {
                        html::TR([], function() use ($currentItem) {
                            html::TD(html::asLink("?collection=".$currentItem['Parent']), function() {
                                html::icon("folder");
                                html::nbsp(2);
                                html::text("..");
                            });
                        });
                    }
                    // Collections
                    $this->listItemsOfType("CollectionType");
                    // Documents
                    $this->listItemsOfType("DocumentType");
                });
            });
        });
    }

    /*****************************************/
    /* Register application */
    /*****************************************/

    /**
     * Register application
     *
     * @param error Exception if the last attempt failed
     */
    protected function register($error) {
        // title
        html::DIV(array("class" => "row"), function() {
            html::DIV(array("class" => "col h1"), self::NAME . " " . self::VERSION);
        });
        // error banner
        if($error) {
            html::DIV(array("class" => "alert alert-danger", "role" => "alert"), "The application could not be registered: " . $error->getMessage());
        }
        // explanation text
        html::DIV(array("class" => "row"), function() {
            html::DIV(array("class" => "col"), function() {
                html::P([], function() {
                    html::text("The application is not yet registered. Login to ");
                    html::A(array("href" => "https://my.remarkable.com", "target" => "_blank"), function() {
                        html::text("the reMarkable");
                        echo("&reg;");
                        html::text("cloud");
                    });
                    html::text(", retrieve a one-time code from ");
                    html::A(array("href" => "https://my.remarkable.com/device/desktop/connect", "target"=>"_blank"), "this address");
                    html::text(" (the code is valid for 5 minutes) and enter the code below:");
                });
            });
        });
        // form
        html::DIV(array("class" => "row g-3 align-items-center"), function() {
            html::DIV(array("class" => "col-auto"), function() {
                html::LABEL(array("for" => "code", "class" => "col-form-label"), "One-time code");
            });
            html::DIV(array("class" => "col-auto"), function() {
                html::INPUT(array("type" => "text", "id" => "code", "class" => "form-control"), null);
            });
            html::DIV(array("class" => "col-auto"), function() {
                html::BUTTON(array("type" => "submit", "class" => "btn btn-primary",
                                   "onclick" => "window.location.href='?code='+document.getElementById('code').value;"),
                             "Register");
            });
        });
    }
    
    /*****************************************/
    /* Download file */
    /*****************************************/

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

    /*****************************************/
    /* Main */
    /*****************************************/

    /**
     * Run the WebUI
     */
    public function run() {
        if($this->data->token != "" && $this->data->download != "") {
            $this->download();
        } else {
            html::openDocument();
            html::HTML(array("xmlns" => "http://www.w3.org/1999/xhtml", "lang" => "en"), function() {
                html::HEAD([], function() {
                    html::META(array("charset" => "utf-8"), null);
                    html::META(array("name" => "viewport", "content" => "width=device-width, initial-scale=1"), null);
                    html::LINK(array("href" => "css/bootstrap.min.css", "rel" => "stylesheet"), null);
                });
                html::BODY([], function() {
                    html::DIV(array("class" => "container-fluid"), function() {
                        // debug banner
                        if($this->mode != "prod") {
                            html::DIV(array("class" => "row bg-warning"), function () {
                                html::DIV(array("class" => "col text-center", "id" => "debug-div"), function() {
                                    html::text("Debug mode enabled.");
                                    html::br();
                                });
                            });
                        }
                        // page content
                        if($this->data->token == "" && $this->data->code == "") {
                            // Register form
                            $this->register(null);
                        } else {
                            // try to register app and reshow form on failure
                            if($this->data->token == "") {
                                try {
                                    $api = new RemarkableAPI(null); // todo implement logger
                                    $this->writeToDebugDiv("Register application...");
                                    $this->data->token = $api->register($this->data->code);
                                    $this->writeToDebugDiv("Application registered.");
                                } catch(\Exception $e) {
                                    $this->writeToDebugDiv("Registration failed!");
                                    $this->register($e);
                                }
                            }
                            // list files
                            if($this->data->token != "") {
                                $this->list();
                            }
                        }
                    });
                    html::DIV(array("class" => "row bg-dark fixed-bottom text-white"), function () {
                        html::DIV(array("class" => "col text-end"), self::NAME.' '.self::VERSION);
                    });
                });
            });
        }                                                       
    }
}

?>
