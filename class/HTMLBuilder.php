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
 * Helper methods for writing HTML
 * (because I find inline HTML dirty)
 */
class HTMLBuilder {
    /**
     * Write a HTML tag.
     * This method is not meant to be called directly. Use the shortcut methods instead (uppercase methods: HTML, HEAD...)
     *
     * @param tagname HTML tag
     * @param attributes Attributes as an associative array
     * @param content Either a function that will generate the content or a string. 
     *                If a string is used, all characters for which HTML entities exists will be replaced by the entity.
     */
    protected static function write($tagname, $attributes, $content) {
        // open
        echo("<" . $tagname);
        foreach($attributes as $name => $value) {
            echo(" " . $name . "=\"" . str_replace("\"", "\\\"", $value) . "\"");
        }
        echo(">");

        // content
        if(is_callable($content)) {
            $content();
        } else if($content != null) {
            self::text($content);
        }

        // close
        echo("</" . $tagname . ">");
    }

    public static function DIV   ($attributes, $content) { return self::write("div",    $attributes, $content); } /**< See write */
    public static function TABLE ($attributes, $content) { return self::write("table",  $attributes, $content); } /**< See write */
    public static function TBODY ($attributes, $content) { return self::write("tbody",  $attributes, $content); } /**< See write */
    public static function TR    ($attributes, $content) { return self::write("tr",     $attributes, $content); } /**< See write */
    public static function TD    ($attributes, $content) { return self::write("td",     $attributes, $content); } /**< See write */
    public static function A     ($attributes, $content) { return self::write("a",      $attributes, $content); } /**< See write */
    public static function P     ($attributes, $content) { return self::write("p",      $attributes, $content); } /**< See write */
    public static function SCRIPT($attributes, $content) { return self::write("script", $attributes, $content); } /**< See write */
    public static function LABEL ($attributes, $content) { return self::write("label",  $attributes, $content); } /**< See write */
    public static function INPUT ($attributes, $content) { return self::write("input",  $attributes, $content); } /**< See write */
    public static function BUTTON($attributes, $content) { return self::write("button", $attributes, $content); } /**< See write */
    public static function HTML  ($attributes, $content) { return self::write("html",   $attributes, $content); } /**< See write */
    public static function HEAD  ($attributes, $content) { return self::write("head",   $attributes, $content); } /**< See write */
    public static function META  ($attributes, $content) { return self::write("meta",   $attributes, $content); } /**< See write */
    public static function LINK  ($attributes, $content) { return self::write("link",   $attributes, $content); } /**< See write */
    public static function BODY  ($attributes, $content) { return self::write("body",   $attributes, $content); } /**< See write */

    /**
     * Open a HTML document
     */
    public static function openDocument() {
        echo("<!DOCTYPE html>");
    }

    /**
     * Add an icon (from the svg/ folder)
     *
     * @param name Icon name without path or file extension (e.g. "icon" => "svg/icon.svg")
     */
    public static function icon($name) {
        echo("<img src=\"svg/" . $name . ".svg\" />");
    }

    /**
     * Add text (escape special characters)
     *
     * @param str Text
     */
    public static function text($str) {
        echo(htmlentities($str));
    }

    /**
     * Add non-breakable spaces
     *
     * @param count Number of spaces
     */
    public static function nbsp($count) {
        for($i = 0; $i < $count; $i++) {
            echo("&nbsp;");
        }
    }

    /**
     * Add a linebreak (BR-tag)
     */
    public static function br() {
        echo("<br/>");
    }

    /**
     * Returns an array containing attributes required to turn any element into a link.
     *
     * @param url URL (href)
     * @return List of attributes
     */
    public static function asLink($url) {
        return array(
            "onclick"     => "window.location.href = '" . str_replace("'", "\\'", $url) . "';",
            "onmouseover" => "document.body.style.cursor = 'pointer';",
            "onmouseout"  => "document.body.style.cursor = 'auto';"
        );
    }
}

?>
