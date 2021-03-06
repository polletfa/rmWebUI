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
 * Manage cache
 */
class Cache {
    const CACHE_DIR = __DIR__ . "/../data/cache/";

    /**
     * Create the cache directory
     */
    static function createCache() {
        if (!file_exists(self::CACHE_DIR)) {
            mkdir(self::CACHE_DIR, 0755, true);
        }
    }

    /**
     * Cleanup cache
     *
     * @param files List of files as in CloudAPI::files().files
     */
    static function cleanupCache($files) {
        // get list of files in cache
        $cache = scandir(self::CACHE_DIR);
        // get list of cached file names for all documents
        $documents = array();
        foreach($files as $item) {
            if($item["Type"] === "DocumentType") {
                array_push($documents, self::getCachedFileName($item["ID"], $item["Version"], "zip", true));
                array_push($documents, self::getCachedFileName($item["ID"], $item["Version"], "pdf", true));
            }
        }
        
        // get list of cached files for which no document has been found
        $remove = array_diff($cache, $documents, [".", ".."]);

        // remove files
        foreach($remove as $file) {
            if(is_file(self::CACHE_DIR.$file)) {
                unlink(self::CACHE_DIR.$file);
            }
        }
    }

    /**
     * Get cached file name
     *
     * @param id Item ID
     * @param version Item version
     * @param format zip or pdf
     * @param filenameOnly Filename only if true, path if false
     * @return file name
     */
    static function getCachedFileName($id, $version, $format, $filenameOnly = false) {
        return ($filenameOnly === true ? "" : self::CACHE_DIR) . $id . "." . $version . "." . $format;
    }
    
    /**
     * Get cached file
     *
     * @param id Item ID
     * @param version Item version
     * @param format zip or pdf
     * @return file content or null
     */
    static function getCachedFile($id, $version, $format) {
        $cachefilecontent = null;
        $cachefile = self::getCachedFileName($id,$version,$format);
        if(file_exists($cachefile)) {
            $cachefilecontent = file_get_contents($cachefile);
        }
        return $cachefilecontent;
    }

    /**
     * Save file to cache
     *
     * @param id Item ID
     * @param version Item version
     * @param format zip or pdf
     * @param filecontent File content
     */
    static function cacheFile($id, $version, $format, $filecontent) {
        self::createCache();
        
        file_put_contents(self::getCachedFileName($id, $version, $format), $filecontent);
    }
}
