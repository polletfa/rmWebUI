/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as fs from "fs";
import * as path from "path";
import { execSync }  from "child_process";

const DIRTY = process.argv[2] == "--dirty";

const TARGET = "_dist";

const FILES = [
    {src: "README.md",                                dest: "README.md"},
    {src: "LICENSE.md",                               dest: "LICENSE.md"},
    {src: "CHANGELOG.md",                             dest: "CHANGELOG.md"},

    // Configuration
    {src: "src/config.yml",                           dest: "config.yml"},

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
    {src: "src/frontend/icons/favicon.svg",           dest: "frontend/favicon.svg"}
];

console.log("Deploy...");

// delete (unless --dirty is provided) and recreate target directory
if(!DIRTY && fs.existsSync(TARGET)) {
    console.log("  Cleanup");
    fs.rmSync(TARGET, {recursive: true});
}

// copy files
for(const file of FILES) {
    console.log("  "+file.dest);
    const outfile = TARGET+"/"+file.dest;
    const outdir = path.dirname(outfile);
    if(!fs.existsSync(outdir)) fs.mkdirSync(outdir, {recursive: true});
    fs.copyFileSync(file.src, outfile);
}

// package.JSON
console.log("  package.json");
const package_json = JSON.parse(fs.readFileSync("package.json", "utf8"));
package_json.scripts = package_json["scripts-dist"];
package_json["scripts-dist"] = undefined;
package_json.devDependencies = undefined;
fs.writeFileSync(TARGET+"/package.json", JSON.stringify(package_json, null, 4));

// install deps (if not DIRTY)
if(!DIRTY) {
    console.log("  node_modules");
    execSync("npm install --only=prod --prefix="+TARGET);
    fs.unlinkSync(TARGET+"/package-lock.json");
}

console.log("Deployed.");
