import * as fs from "fs";

const TARGET = "_install";
const DIRECTORIES = [
    "backend",
    "data",
    "sampledata"
];

const FILES = [
    {src: "package.json",                   dest: "package.json"},
    
    {src: "src/backend/Backend.js",         dest: "backend/Backend.js"},
    {src: "src/backend/FakeCloud.js",       dest: "backend/FakeCloud.js"},
    {src: "src/backend/ICloud.js",          dest: "backend/ICloud.js"},
    {src: "src/backend/index.js",           dest: "backend/index.js"},
    {src: "src/backend/Info.js",            dest: "backend/Info.js"},
    {src: "src/backend/SessionManager.js",  dest: "backend/SessionManager.js"},

    {src: "sampledata/files.json",          dest: "sampledata/files.json"},
    {src: "sampledata/sample_pdf.pdf",      dest: "sampledata/sample_pdf.pdf"},
    {src: "sampledata/sample_pdf.zip",      dest: "sampledata/sample_pdf.zip"},
    {src: "sampledata/sample_notebook.pdf", dest: "sampledata/sample_notebook.pdf"},
    {src: "sampledata/sample_notebook.zip", dest: "sampledata/sample_notebook.zip"},
    
    {src: "ssl/cert.pem",                   dest: "data/cert.pem"},
    {src: "ssl/key.pem",                    dest: "data/key.pem"},
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

