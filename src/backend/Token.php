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

/**
 * Authentication token
 */
class Token {
    /**
     * Token file (the token is required to connect to the reMarkable Cloud).
     */
    const TOKEN_FILE = __DIR__ . "/../data/auth.json";

    /**
     * Get token
     *
     * @return Token or false
     */
    static function get() {
        return json_decode(file_get_contents(self::TOKEN_FILE))->token;
    }

    /**
     * Set token
     *
     * @param token Authentication token
     * @return Success (true/false)
     */
    static function set($token) {
        if(false === file_put_contents(self::TOKEN_FILE, json_encode(array("token"=>$token)))) {
            return false;
        } else {
            return true;
        }
    }
 }
