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

// Frontend builder
class FrontendBuilder {
    readonly INCLUDE_FROM = "src/frontend";
    readonly IMPORT_FROM = "src/frontend";

    readonly MAIN = "src/frontend/layout/index.html";
    readonly BUNDLE = "_build/src/frontend.js";
    readonly PACKAGE_JSON = "package.json";
    
    readonly OUTPUT = "_build/src/frontend.html";

    protected result: string;
    protected imports: string[] = [];
    protected package_json: {displayName: string, version: string};
    
    constructor() {
        console.log("Building frontend...");
        this.result = fs.readFileSync(this.MAIN, "utf8");
        this.package_json = JSON.parse(fs.readFileSync(this.PACKAGE_JSON, "utf8"));
    }

    /**
     * Save the result
     */
    public save(): void {
        fs.mkdirSync(path.dirname(this.OUTPUT), {recursive: true});
        fs.writeFileSync(this.OUTPUT, this.result);
        console.log("Frontend build.");
    }

    /**
     * Replace all !include statements by their content iteratively until none is left.
     */
    public replaceIncludeStatements(): FrontendBuilder {
        let match: RegExpMatchArray|null;
        do {
            match = this.result.match(/<!include\s+([^>\s]+)\s*>/);
            if(match) {
                console.log("  Include '"+match[1]+"'");
                this.result = this.result.replace(match[0], fs.readFileSync(this.INCLUDE_FROM + "/" + match[1], "utf8"));
            }
        } while(match);
        return this;
    }

    /**
     * Replace !name and !version statements
     */
    public replaceNameAndVersionStatements(): FrontendBuilder {
        this.result = this.result
            .replace(/<!name>/g, this.package_json.displayName)
            .replace(/<!version>/g, this.package_json.version);
        return this;
    }

    /**
     * Remove HTML comments except those beginning with <!--!
     */
    public removeHTMLComments(): FrontendBuilder {
        this.result = this.result.replace(/<!--[^!][\S\s]+?-->\n?/g, "");
        return this;
    }

    /**
     * Trim lines and remove empty lines
     */
    public trimLines(): FrontendBuilder {
        this.result = this.result.split("\n").map(line => line.trim()).filter(line => line != "").join("\n");
        return this;
    }

    /**
     * Remove spaces between elements
     */
    public removeSpacesBetweenElements(): FrontendBuilder {
        this.result = this.result.replace(/>[ \t\r]*</g, "><");
        return this;
    }
    
    /**
     * Read and remove !import statements
     */
    public readAndRemoveImportStatements(): FrontendBuilder {
        let match: RegExpMatchArray|null;
        do {
            match = this.result.match(/<!import\s+([^>\s]+)\s*>/);
            if(match) {
                this.imports.push(match[1]);
                this.result = this.result.replace(match[0], "");
            }
        } while(match);
        return this;
    }

    /**
     * Import files
     */
    public importFiles(): FrontendBuilder {
        while(this.imports.length > 0) {
            const imported = this.imports.shift();
            if(imported) {
                if(imported.substr(-3).toLowerCase() === ".js") {
                    console.log("  Import JavaScript '"+imported+"'");
                    this.result = this.result.replace(/<\/body>/, "<script>"+fs.readFileSync(this.IMPORT_FROM+"/"+imported, "utf8")+"</script>\n</body>");
                } else if(imported.substr(-4).toLowerCase() === ".css") {
                    console.log("  Import CSS '"+imported+"'");
                    this.result = this.result.replace(/<\/head>/, "<style>"+fs.readFileSync(this.IMPORT_FROM+"/"+imported, "utf8")+"</style>\n</head>");
                } else {
                    console.log("  WARNING: Unknown import '"+imported+"' (wrong type)");
                }
            }
        }
        return this;
    }

    /**
     * Add placeholder for configuration from backend
     */
    public addConfigPlaceholder(): FrontendBuilder {
        console.log("  Add placeholder for backend configuration");
        this.result = this.result.replace(/<\/body>/, '<script id="backendconfig" type="application/json"><!backendconfig></script></body>');
        return this;
    }
    
    /**
     * Add JavaScript bundle
     */
    public addBundle(): FrontendBuilder {
        console.log("  Import JavaScript bundle");
        this.result = this.result.replace(/<\/body>/, "<script>"+fs.readFileSync(this.BUNDLE, "utf8")+"</script>\n</body>");
        return this;
    }
}

// build frontend
new FrontendBuilder()
    .replaceIncludeStatements()
    .readAndRemoveImportStatements()
    .replaceNameAndVersionStatements()
    .removeHTMLComments()
    .trimLines()
    .removeSpacesBetweenElements()
    .importFiles()
    .addConfigPlaceholder()
    .addBundle()
    .save();
