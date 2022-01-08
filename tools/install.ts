import * as fs from "fs";

const TARGET = "_install";
const DIRECTORIES = [
    "backend",
    "data",
    "data/sample"
];

const FILES = [
    {src: "package.json",                       dest: "package.json"},

    // Backend
    {src: "src/backend/APIBase.js",             dest: "backend/APIBase.js"},
    {src: "src/backend/Backend.js",             dest: "backend/Backend.js"},
    {src: "src/backend/Constants.js",           dest: "backend/Constants.js"},
    {src: "src/backend/FakeCloudAPI.js",        dest: "backend/FakeCloudAPI.js"},
    {src: "src/backend/ICloudAPI.js",           dest: "backend/ICloudAPI.js"},
    {src: "src/backend/InfoAPI.js",             dest: "backend/InfoAPI.js"},
    {src: "src/backend/index.js",               dest: "backend/index.js"},
    {src: "src/backend/SessionAPI.js",          dest: "backend/SessionAPI.js"},
    {src: "src/backend/SessionManager.js",      dest: "backend/SessionManager.js"},

    // Sample data for FakeCloudAPI
    {src: "src/sampledata/files.json",          dest: "data/sample/files.json"},
    {src: "src/sampledata/sample_pdf.pdf",      dest: "data/sample/sample_pdf.pdf"},
    {src: "src/sampledata/sample_pdf.zip",      dest: "data/sample/sample_pdf.zip"},
    {src: "src/sampledata/sample_notebook.pdf", dest: "data/sample/sample_notebook.pdf"},
    {src: "src/sampledata/sample_notebook.zip", dest: "data/sample/sample_notebook.zip"},

    // SSL data for HTTPS
    {src: "src/ssl/cert.pem",                   dest: "data/cert.pem"},
    {src: "src/ssl/key.pem",                    dest: "data/key.pem"},
]
 
// delete and recreate target directory
if(fs.existsSync(TARGET)) {
    fs.rmSync(TARGET, {recursive: true})
}
fs.mkdirSync(TARGET, {recursive: true});

// create directory structure
for(const dir of DIRECTORIES) {
    fs.mkdirSync(TARGET+"/"+dir, {recursive:true});
}

// copy files
for(const file of FILES) {
    fs.copyFileSync(file.src, TARGET+"/"+file.dest);
}

