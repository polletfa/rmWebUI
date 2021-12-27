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
 * - favicon
 * - Use a logger for the RemarkableAPI class
 * - Nice to have:
 *   - Implement upload
 *   - Internationalization/Translation
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
    const VERSION = "0.3.0";
    
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
        $this->writeToDebugDiv("Initialize the Cloud API...");
        $api = new RemarkableAPI(null);
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
                echo("document.getElementById('debug-div').innerHTML += '".str_replace("\n", "<br/>", str_replace("'", "\\'", $text))."<br/>';");
            });
        }
    }

    /**
     * Set title
     *
     * @param text Title text
     * @param refresh Show refresh button if true
     */
    protected function setTitle($text, $refresh) {
        html::SCRIPT([], function() use($text, $refresh) {
            echo("document.getElementById('title-bar').innerHTML = '".str_replace("'", "\\'", $text)."';");
            if($refresh == true) {
                echo("if(document.getElementById('refresh-button').classList.contains('d-none')) document.getElementById('refresh-button').classList.remove('d-none');");
            } else {
                echo("if(!document.getElementById('refresh-button').classList.contains('d-none')) document.getElementById('refresh-button').classList.add('d-none');");
            }
        });            
    }

    /**
     * Save error in session and reload
     *
     * @param error Error string
     * @param exception Exception or message for debugging
     */
    protected function setErrorAndReload($error, $exception) {
        $this->data->lastException = $exception instanceof \Exception ? $exception->getMessage() : $exception;
        $this->data->lastError = $error;
        header('Location: ?collection='.$this->data->collection);
    }

    /**
     * Set error
     *
     * @param error Error string
     * @param exception Exception or message for debugging
     */
    protected function setError($error, $exception) {
        html::SCRIPT([], function() use ($error, $exception) {
            echo("document.getElementById('error-banner').innerHTML = '".str_replace("'", "\\'", $error)."';");
            echo("document.getElementById('error-banner').classList.remove('d-none');");
        });
        $this->writeToDebugDiv($exception instanceof \Exception ? $exception->getMessage() : $exception);
    }

    /**
     * Clear error from session
     */
    protected function clearError() {
        $this->data->lastError = null;
        $this->data->lastException = null;
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
                        $url = $type == "CollectionType" ? "?collection=".$item["ID"] : "?collection=".$this->data->collection."&download=".$item["ID"];
                        html::TD(html::asLink($url), function() use ($type,$item) {
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
        [$currentPath,$currentItem] = $this->findItem($this->data->collection);

        // write title line (collection + refresh button)
        $this->setTitle($currentPath, true);

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
     */
    protected function register() {
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

        // Get file
        try {
            $api = $this->initAPI();
        } catch(\Exception $e) {
            $this->setErrorAndReload("Unable to connect to the cloud! You may try to <a href=\"?unregister\">clear the access token</a> and register the application again", $e);
            return;
        }
        try {
            $filecontent = $api->downloadDocument($this->data->download)->getBody();
        } catch(\Exception $e) {
            $this->setErrorAndReload("Unable to download the file from the cloud! You may try to <a href=\"?refresh&collection=".$this->data->collection."\">refresh</a>.", $e);
            return;
        }
        
        if($this->rmrl != null && $this->rmrl != "") {
            // Convert with rmrl
            $tmpfile = "/tmp/".$this->data->download.".zip";
            file_put_contents($tmpfile, $filecontent);
            $resultcode = null;
            $output = null;
            exec($this->rmrl." ".$tmpfile . " 2>&1", $output, $resultcode);
            if($resultcode != 0) {
                $this->setErrorAndReload("Unable to convert the file to PDF.", implode("\n", $output));
            } else {
                header('Content-Type:application/pdf');
                header('Content-Disposition:attachment;filename='.$filename.'.pdf');
                echo(implode("\n",$output));
            }
       } else {
            // write original ZIP file (no conversion to PDF)
            header('Content-Type:application/zip');
            header('Content-Disposition:attachment;filename='.$filename.'.zip');
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
                        
                        // title
                        html::DIV(array("class" => "row"), function() {
                            html::DIV(array("id" => "title-bar", "class" => "col h1"), self::NAME." ".self::VERSION);
                            html::DIV(array("id" => "refresh-button", "class" => "col col-sm-1 d-flex align-items-center justify-content-end d-none"), function() {
                                html::A(array("href" => "?collection=" . $this->data->collection . "&refresh"), function() {
                                    html::icon("refresh");
                                });
                            });
                        });

                        // error banner
                        html::DIV(array("id" => "error-banner", "class" => "alert alert-danger d-none", "role" => "alert"), "");
                        if($this->data->lastError) {
                            $this->setError($this->data->lastError, $this->data->lastException);
                            $this->clearError();
                        }
                        
                        // page content
                        if($this->data->token == "" && $this->data->code == "") {
                            // Register form
                            $this->register();
                        } else {
                            // try to register app and reshow form on failure
                            if($this->data->token == "") {
                                try {
                                    $api = new RemarkableAPI(null);
                                    $this->writeToDebugDiv("Register application...");
                                    $this->data->token = $api->register($this->data->code);
                                    $this->writeToDebugDiv("Application registered.");
                                } catch(\Exception $e) {
                                    $this->register();
                                    $this->setError("The application could not be registered.", $e);
                                }
                            }
                            if($this->data->token != "") {
                                // retrieve file list
                                if($this->data->tree == null) {
                                    $api = null;
                                    try {
                                        $api = $this->initAPI();
                                    } catch(\Exception $e) {
                                        // cloud API error
                                        $this->setError("Unable to connect to the cloud! You may try to <a href=\"?unregister\">clear the access token</a> and register the application again", $e);
                                    }
                                    if($api) {
                                        try {
                                            $this->writeToDebugDiv("Retrieve file list from the cloud...");
                                            $fs = new RemarkableFS($api);
                                            $this->data->tree = $fs->getTree();
                                        } catch(\Exception $e) {
                                            $this->setError("Unable to retrieve the file list from the cloud!", $e);
                                        }
                                    }
                                }
                                
                                // list files
                                if($this->data->tree != null) {
                                    $this->list();
                                }
                            }
                        }
                    });
                    // footer
                    html::DIV(array("class" => "row bg-dark fixed-bottom text-white"), function () {
                        html::DIV(array("class" => "col text-end"), self::NAME.' '.self::VERSION);
                    });
                });
            });
        }
    }
}

?>
