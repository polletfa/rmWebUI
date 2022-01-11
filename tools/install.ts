/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as fs from "fs";

const DIRTY = process.argv[2] == "--dirty";

const TARGET = "_dist";
const DIRECTORIES = [
    "backend",
    "backend/samples",
    "data",
    "frontend"
];

const FILES = [
    {src: "README.md",                                dest: "README.md"},
    {src: "LICENSE.md",                               dest: "LICENSE.md"},
    {src: "CHANGELOG.md",                             dest: "CHANGELOG.md"},

    // Backend
    {src: "_build/src/backend.js",                    dest: "backend/index.js"},

    // Sample data for FakeCloudAPI
    {src: "src/backend/samples/files.json",           dest: "backend/samples/files.json"},
    {src: "src/backend/samples/sample_pdf.pdf",       dest: "backend/samples/sample_pdf.pdf"},
    {src: "src/backend/samples/sample_pdf.zip",       dest: "backend/samples/sample_pdf.zip"},
    {src: "src/backend/samples/sample_notebook.pdf",  dest: "backend/samples/sample_notebook.pdf"},
    {src: "src/backend/samples/sample_notebook.zip",  dest: "backend/samples/sample_notebook.zip"},

    // Frontend
    {src: "_build/src/frontend.html",                 dest: "frontend/index.html"},

    // Frontend - Favicon
    {src: "src/frontend/resources/favicon.svg",       dest: "frontend/favicon.svg"}
];
 
// delete (unless --dirty is provided) and recreate target directory
if(!DIRTY && fs.existsSync(TARGET)) {
    fs.rmSync(TARGET, {recursive: true});
}
if(!fs.existsSync(TARGET))
    fs.mkdirSync(TARGET, {recursive: true});
   
// create directory structure
for(const dir of DIRECTORIES) {
    fs.mkdirSync(TARGET+"/"+dir, {recursive:true});
}

// copy files
for(const file of FILES) {
    fs.copyFileSync(file.src, TARGET+"/"+file.dest);
}

// package.JSON
const package_json = JSON.parse(fs.readFileSync("package.json", "utf8"));
package_json.scripts = package_json["scripts-dist"];
package_json["scripts-dist"] = undefined;
package_json.devDependencies = undefined;
fs.writeFileSync(TARGET+"/package.json", JSON.stringify(package_json, null, 4));
