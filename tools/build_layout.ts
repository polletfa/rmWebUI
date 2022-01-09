import * as fs from "fs";

const LAYOUT_DIR = "src/frontend/layout";
const OUTPUT_DIR = "_build/src/frontend";

function replaceIncludeStatements(output: string) {
    const reStr = '<!include\\s+([\\S]+)\\s*>';
    const matches = output.match(new RegExp(reStr, "g"));
    if(matches) {
        for(const match of matches) {
            const parse = match.match(new RegExp(reStr));
            if(parse) {
                const file = LAYOUT_DIR + "/" + parse[1] + ".html";
                output = output.replace(match, fs.readFileSync(file, "utf8"));
            }
        }
    }
    return output;
}

// load file
let output = fs.readFileSync(LAYOUT_DIR+"/"+process.argv[2]+".html", "utf8");

// recursively include files
for(let i = 1; ; i++) {
    const newOutput = replaceIncludeStatements(output);
    if(newOutput == output) { // no more changes
        break;
    }
    output = newOutput;
}

// write output
fs.mkdirSync(OUTPUT_DIR, {recursive: true});
fs.writeFileSync(OUTPUT_DIR+"/"+process.argv[2]+".html", output);
