/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as fs from "fs";
import * as yaml from "js-yaml";

import { BackendApplication } from "./BackendApplication";
import { Constants } from "./Constants";
import { ServerConfig } from "./types/Config";

// eslint-disable-next-line
type ParsedYAML = any;

export class ConfigHelper {
    public static load(backend: BackendApplication): ServerConfig[] {
        const file = process.argv[2] ? process.argv[2] : Constants.CONFIG_FILE;
        backend.log("Use configuration file: " + file);
        if(process.argv[2] == undefined && !fs.existsSync(file)) { // if a file has been specified but doesn't exists, we want to fail.
            backend.log("No configuration file. Using default configuration.");
            return [ Constants.DEFAULT_CONFIG ];
        } else {
            const yamltree = yaml.load(fs.readFileSync(file, "utf8")) as ParsedYAML;
            const defaultConfig = ConfigHelper.readServerConfig(backend, yamltree, Constants.DEFAULT_CONFIG);
            
            if(yamltree && "servers" in yamltree) {
                // multiple server configurations
                // the parameters outside the "servers" list are used as default parameters
                backend.log("Multiple server configurations found.");
                return yamltree.servers.map((serverconfig: ParsedYAML) => { return ConfigHelper.readServerConfig(backend, serverconfig, defaultConfig); });
            } else {
                // single server configuration
                backend.log("Single server configuration found.");
                return [ defaultConfig ];
            }
        }
    }

    public static serverConfigToString(config: ServerConfig, onlyChanges: boolean): string {
        if(onlyChanges) {
            // eslint-disable-next-line
            const objDiff = (objOrig: any, ref: any): any => {
                const obj = Object.assign({}, objOrig);
                for(const key of Object.keys(obj)) {
                    if(typeof obj[key] == "object") obj[key] = objDiff(obj[key], ref[key]);
                    else if(obj[key] === ref[key]) obj[key] = undefined;
                }
                return JSON.stringify(obj) == "{}" ? undefined : obj;
            };
            const diff = objDiff(config, Constants.DEFAULT_CONFIG);
            return diff ? JSON.stringify(diff, null, 2) : "default";
        } else {
            return JSON.stringify(config);
        }
    }

    protected static readServerConfig(backend: BackendApplication, yamltree: ParsedYAML, defaultConfig: ServerConfig): ServerConfig {
        const data = {
            name: ConfigHelper.checkString(yamltree, "name", defaultConfig.name),
            port: ConfigHelper.checkNumber(yamltree, "port", defaultConfig.port),
            demo: ConfigHelper.checkBoolean(yamltree, "demo", defaultConfig.demo),
            sessionMaxIdle: ConfigHelper.checkDuration(yamltree, "sessionMaxIdle", defaultConfig.sessionMaxIdle),
            logHeaders: ConfigHelper.checkBoolean(yamltree, "logHeaders", defaultConfig.logHeaders),
            
            allowInsecure: ConfigHelper.checkBoolean(yamltree, "allowInsecure", defaultConfig.allowInsecure),

            ssl: {cert: defaultConfig.ssl.cert, key: defaultConfig.ssl.key},
            
            data: ConfigHelper.checkString(yamltree, "data", defaultConfig.data),
            cache: ConfigHelper.checkBoolean(yamltree, "cache", defaultConfig.cache),
            pdfconverter: ConfigHelper.checkString(yamltree, "pdfconverter", defaultConfig.pdfconverter),
            
            fakeRegisterCode: ConfigHelper.checkString(yamltree, "fakeRegisterCode", defaultConfig.fakeRegisterCode),
            fakeDelay: ConfigHelper.checkDuration(yamltree, "fakeDelay", defaultConfig.fakeDelay)
        };

        if(data.fakeRegisterCode != "") {
            const fixedFakeRegisterCode = (data.fakeRegisterCode.replace(/[^0-9a-zA-Z]/g, "") + "00000000").substr(0,8);
            if(data.fakeRegisterCode != fixedFakeRegisterCode) {
                backend.log("WARNING: Registration code '"+data.fakeRegisterCode+"' was not valid and has been changed to '"+fixedFakeRegisterCode+"'");
                data.fakeRegisterCode = fixedFakeRegisterCode;
            }
        }
        
        if(yamltree && yamltree["ssl"] !== undefined) {
            data.ssl = {
                cert: ConfigHelper.checkString(yamltree.ssl, "cert", defaultConfig.ssl.cert),
                key: ConfigHelper.checkString(yamltree.ssl, "key", defaultConfig.ssl.key)
            };
        }
        
        return data;
    }

    /**
     * Validate a string parameter. Null is accepted and replaced by an empty string
     *
     * Return the default value if missing.
     * Throws an exception if invalid format.
     * Returns the value otherwise
     */
    protected static checkString(yamltree: ParsedYAML, key: string, defaultValue: string): string {
        if(yamltree && yamltree[key] !== undefined && yamltree[key] !== null)
            return yamltree[key];
        else
            return yamltree[key] === null ? "" : defaultValue;
    }

    /**
     * Validate a number parameter. Null is accepted and replaced by 0
     *
     * Return the default value if missing.
     * Throws an exception if invalid format.
     * Returns the value otherwise
     */
    protected static checkNumber(yamltree: ParsedYAML, key: string, defaultValue: number): number {
        if(yamltree && yamltree[key] !== undefined && yamltree[key] !== null) {
            if(isNaN(yamltree[key])) throw new Error("Invalid value for "+key+" (not a number)");
            return yamltree[key];
        } else {
            return yamltree[key] === null ? 0 : defaultValue;
        }
    }

    /**
     * Validate a boolean parameter. Null is accepted and replaced by false
     *
     * Return the default value if missing.
     * Throws an exception if invalid format.
     * Returns the value otherwise
     */
    protected static checkBoolean(yamltree: ParsedYAML, key: string, defaultValue: boolean): boolean {
        if(yamltree && yamltree[key] !== undefined && yamltree[key] !== null) {
            if(typeof yamltree[key] != "boolean") throw new Error("Invalid value for "+key+" (not a boolean)");
            return yamltree[key];
        } else {
            return yamltree[key] === null ? false : defaultValue;
        }
    }    

    /**
     * Read a string as a duration with unit s, m, h or d and return the result in milliseconds
     */
    protected static checkDuration(yamltree: ParsedYAML, key: string, defaultValue: number): number {
        if(yamltree && yamltree[key] !== undefined && yamltree[key] !== null) {
            const str = String(yamltree[key]);
            const unit = str[str.length-1];
            const value = Number(str.substr(0, str.length - 1));
            
            if(isNaN(value) || (unit != "s" && unit != "m" && unit != "h" && unit != "d")) {
                throw new Error("Invalid value for "+key+" (not a duration)");
            }
            return value * (unit == "s" ? 1000 : unit == "m" ? 1000*60 : unit == "h" ? 1000*60*60 : 1000*60*60*24);
        } else {
            return defaultValue;
        }
    }
}
