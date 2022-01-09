import * as fs from "fs";

const DIRTY = process.argv[2] == "--dirty";

const TARGET = "_dist";
const DIRECTORIES = [
    "backend",
    "data",
    "data/sample",
    "frontend"
];

const FILES = [
    {src: "package.json",                             dest: "package.json"},
    {src: "README.md",                                dest: "README.md"},
    {src: "LICENSE.md",                               dest: "LICENSE.md"},
    {src: "CHANGELOG.md",                             dest: "CHANGELOG.md"},

    // Backend
    {src: "_build/src/backend/APIBase.js",            dest: "backend/APIBase.js"},
    {src: "_build/src/backend/APITypes.js",           dest: "backend/APITypes.js"},   
    {src: "_build/src/backend/Backend.js",            dest: "backend/Backend.js"},
    {src: "_build/src/backend/BackendAPI.js",         dest: "backend/BackendAPI.js"},
    {src: "_build/src/backend/CloudAPITypes.js",      dest: "backend/CloudAPITypes.js"},
    {src: "_build/src/backend/Constants.js",          dest: "backend/Constants.js"},
    {src: "_build/src/backend/FakeCloudAPI.js",       dest: "backend/FakeCloudAPI.js"},
    {src: "_build/src/backend/ICloudAPI.js",          dest: "backend/ICloudAPI.js"},
    {src: "_build/src/backend/index.js",              dest: "backend/index.js"},
    {src: "_build/src/backend/SessionManager.js",     dest: "backend/SessionManager.js"},

    // Sample data for FakeCloudAPI
    {src: "data/sample/files.json",                   dest: "data/sample/files.json"},
    {src: "data/sample/sample_pdf.pdf",               dest: "data/sample/sample_pdf.pdf"},
    {src: "data/sample/sample_pdf.zip",               dest: "data/sample/sample_pdf.zip"},
    {src: "data/sample/sample_notebook.pdf",          dest: "data/sample/sample_notebook.pdf"},
    {src: "data/sample/sample_notebook.zip",          dest: "data/sample/sample_notebook.zip"},

    // Frontend
    {src: "_build/src/frontend/index.html",           dest: "frontend/index.html",                minify: true},
    {src: "_build/src/frontend/bundle.js",            dest: "frontend/bundle.js",                 minify: true},

    // Frontend - resources
    {src: "src/frontend/resources/favicon.svg",       dest: "frontend/favicon.svg"},
    {src: "src/frontend/resources/download.svg",      dest: "frontend/download.svg"},
    {src: "src/frontend/resources/empty.svg",         dest: "frontend/empty.svg"},
    {src: "src/frontend/resources/file.svg",          dest: "frontend/file.svg"},
    {src: "src/frontend/resources/folder.svg",        dest: "frontend/folder.svg"},
    {src: "src/frontend/resources/refresh.svg",       dest: "frontend/refresh.svg"},
    {src: "src/frontend/resources/bootstrap.min.css", dest: "frontend/bootstrap.min.css"},
    {src: "src/frontend/resources/bootstrap.min.js",  dest: "frontend/bootstrap.min.js"},
    
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
    if(file.minify) {
        // minify 8 must be imported dynamically but TypeScript will convert into a require with commonjs.
        // we use a Function object to ensure the TypeScript transpiler doesn't change it.
        (new Function("return import('minify')"))().then((minify: {minify: (a:string)=>Promise<string>}) => {
            minify.minify(file.src).then((result:string) => {
                fs.writeFileSync(TARGET+"/"+file.dest, result);
            });
        });
    } else {
        fs.copyFileSync(file.src, TARGET+"/"+file.dest);
    }
}

