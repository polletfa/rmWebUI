<?php

namespace digitalis\rmWebUI;

/**
 * Class to manage data from:
 * - URL parameters
 * - Session data
 * - Configuration
 *
 * Available parameters:
 * - collection, read-only, from URL
 * - tree, read-write, from session data
 * - token, read-write, from configuration file config/auth.token
 */
class Data {
    /**
     * Configuration directory
     */
    const CONFIG_DIR = __DIR__ . '/../config';
    /**
     * Token file (the token is required to connect to the reMarkable Cloud).
     */
    const TOKEN_FILE = self::CONFIG_DIR . '/auth.token';

    /**
     * Constructor: initialize session
     */
    function __construct() {
        // Init session
        session_start();
        if(isset($_GET["refresh"])) session_unset();
    }

    /**
     * Get an element from an array.
     *
     * @param array Array
     * @param name Name of the element
     * @param default Default value if the element is not in the array
     * @return Value of the element or default value
     */
    protected function getFrom($array, $name, $default) {
        return isset($array[$name]) ? $array[$name] : $default;
    }

    /**
     * Getter
     *
     * @param name Name of the parameter: collection, tree, token
     * @return value of the parameter
     * @throws Exception on invalid name
     */
    function __get($name) {
        // URL parameters
        if($name == "collection") return $this->getFrom($_GET, "collection", "");

        // Session data
        else if($name == "tree") return $this->getFrom($_SESSION, "tree", null);

        // Configuration
        else if($name == "token") return file_exists(self::TOKEN_FILE) ? file_get_contents(self::TOKEN_FILE) : "";

        // Wrong name
        else throw new \Exception("invalid name");
    }

    /**
     * Setter
     *
     * @param name Name of the parameter
     * @param value Value to set
     * @throws Exception on invalid name
     */
    function __set($name, $value) {
        // URL parameters
        if($name == "collection") throw new \Exception("collection is readonly");

        // Session data
        else if($name == "tree") $_SESSION["tree"] = $value;

        // Configuration
        else if($name == "token") file_put_contents(self::TOKEN_FILE, $value);

        // Wrong name
        else throw new \Exception("invalid name");
    }
}

?>
