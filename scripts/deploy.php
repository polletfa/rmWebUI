<?php
/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE file)
 *
 *****************************************************/

//-------------------------- Definitions

$PACKAGE_ROOT = __DIR__ . "/..";
$DEPLOY_AS_DEMO = isset($argv[1]) && $argv[1] == "demo";
$INSTALL_DIR = $DEPLOY_AS_DEMO ? "demo" : "dist";

$FILES = array(
    "Documentation" => array(
        "" => array(
            "src" => "",
            "dest" => "",
            "files" => [
                "CHANGELOG.md",
                "LICENSE.md",
                "README.md"
            ])),
    "Configuration" => array(
        "" => array(
            "src" => "src/data",
            "dest" => "data",
            "files" => [
                "config.json"
            ])),
    "Backend" => array(
        "API files" => array(
            "src" => "src/backend/api",
            "dest" => "src/backend/api",
            "files" => [
                "download.php",
                "files.php",
                "register.php"
            ]),
        "classes" => array(
            "src" => "src/backend",
            "dest" => "backend",
            "files" => [
                "Cache.php",
                "CloudAPI.php",
                "Download.php",
                "Token.php"
            ])),
    "Backend for live demonstration" => array(
        "API files" => array(
            "src" => "src/demo_backend/api",
            "dest" => "backend/api",
            "files" => [
                "download.php",
                "files.php",
                "register.php"
            ]),
        "Sample files" => array(
            "src" => "src/demo_backend/data",
            "dest" => "data",
            "files" => [
                "files.json",
                "sample_notebook.pdf",
                "sample_notebook.zip",
                "sample_pdf.pdf",
                "sample_pdf.zip"
            ])),            
    "Frontend" => array(
        "Redirection" => array(
            "src" => "src",
            "dest" => "",
            "files" => [
                "index.html"
            ]),
        "Main files" => array(
            "src" => "src/frontend",
            "dest" => "frontend",
            "files" => [
                "index.html",
                "rmWebUI.js"
            ]),
        "Pages" => array(
            "src" => "src/frontend/pages",
            "dest" => "frontend/pages",
            "files" => [
                "list.html",
                "list.js",
                "register.html",
                "register.js"
            ]),
        "Resources" => array(
            "src" => "src/frontend/resources",
            "dest" => "frontend/resources",
            "files" => [
                "bootstrap.min.css",
                "bootstrap.min.js",
                "cloud.svg",
                "download.svg",
                "empty.svg",
                "file.svg",
                "folder.svg",
                "refresh.svg"
            ]))
);

//-------------------------- Functions

function makePath() {
    foreach (func_get_args() as $arg) {
        if ($arg !== '') { $components[] = $arg; }
    }
    return preg_replace("#/+#", "/", implode("/", $components));
}

function rrmdir($dir) { 
    if (is_dir($dir)) { 
        $objects = scandir($dir);
        foreach ($objects as $object) { 
            if ($object != "." && $object != "..") { 
                if (is_dir($dir. "/" .$object) && !is_link($dir."/".$object))
                    rrmdir($dir. "/" .$object);
                else
                    unlink($dir. "/" .$object); 
            } 
        }
        rmdir($dir); 
    } 
}

function installFile($file, $src, $dest) {
    global $PACKAGE_ROOT;
    global $INSTALL_DIR;
    
    $inputfile = makePath($PACKAGE_ROOT, $src, $file);
    $outputdir = makePath($PACKAGE_ROOT, $INSTALL_DIR, $dest);
    $outputfile = makePath($outputdir, $file);

    if(!file_exists($outputdir)) {
        mkdir($outputdir, 0755, true);
    }
    copy($inputfile, $outputfile);
    chmod($outputfile, 0644);
}

function installPackages($pkg) {
    global $FILES;
    
    echo($pkg ."\n");
    foreach($FILES[$pkg] as $component => $def) {
        if($component != "") echo("- Deploy ".$component."\n");
        foreach($def["files"] as $file) {
            installFile($file, $def["src"], $def["dest"]);
        }
    }
}

function writeVersionFile() {
    global $INSTALL_DIR;
    global $PACKAGE_ROOT;
    global $DEPLOY_AS_DEMO;
    
    echo "Wrote version file\n";
    $composer = json_decode(file_get_contents($PACKAGE_ROOT . "/composer.json"));
    $version = array("name" => $composer->displayName, "version" => $composer->version, "demo" => $DEPLOY_AS_DEMO);
    file_put_contents(makePath($PACKAGE_ROOT, $INSTALL_DIR, "version.json"), json_encode($version));
}

function installDependencies() {
    global $INSTALL_DIR;
    global $PACKAGE_ROOT;

    echo("\nInstall dependencies\n");
    installFile("composer.json", "", "");
    chdir(makePath($PACKAGE_ROOT, $INSTALL_DIR));
    `composer install`;
    unlink("composer.json");
    unlink("composer.lock");
}

function clearInstall() {
    global $PACKAGE_ROOT;
    global $INSTALL_DIR;
    
    $installTo = makePath($PACKAGE_ROOT, $INSTALL_DIR);
    if(file_exists($installTo)) { rrmdir($installTo); }
}

//-------------------------- Install

clearInstall();
installPackages("Documentation");
installPackages("Configuration");
installPackages("Frontend");
installPackages("Backend" . ($DEPLOY_AS_DEMO ? " for live demonstration" : ""));
writeVersionFile();
installDependencies();
?>
