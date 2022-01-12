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

import { Backend } from "./Backend";
import { ServerConfig } from "./Config";
import { Constants } from "./Constants";

// eslint-disable-next-line
type ParsedYAML = any;

export class ConfigLoader {
    public static load(backend: Backend): ServerConfig[] {
        const file = process.argv[2] ? process.argv[2] : Constants.CONFIG_FILE;
        backend.log("Use configuration file: " + file);
        if(process.argv[2] == undefined && !fs.existsSync(file)) { // if a file has been specified but doesn't exists, we want to fail.
            backend.log("No configuration file. Using default configuration.");
            return [ Constants.DEFAULT_CONFIG ];
        } else {
            const yamltree = yaml.load(fs.readFileSync(file, "utf8")) as ParsedYAML;
            const defaultConfig = ConfigLoader.readServerConfig(yamltree, Constants.DEFAULT_CONFIG);
            
            if(yamltree && "servers" in yamltree) {
                // multiple server configurations
                // the parameters outside the "servers" list are used as default parameters
                backend.log("Multiple server configurations found.");
                return yamltree.servers.map((serverconfig: ParsedYAML) => { return ConfigLoader.readServerConfig(serverconfig, defaultConfig); });
            } else {
                // single server configuration
                backend.log("Single server configuration found.");
                return [ defaultConfig ];
            }
        }
    }

    protected static readServerConfig(yamltree: ParsedYAML, defaultConfig: ServerConfig): ServerConfig {
        return {
            name: yamltree && "name" in yamltree ? yamltree.name : defaultConfig.name,
            port: yamltree && "port" in yamltree && !isNaN(yamltree.port) ? Number(yamltree.port) : defaultConfig.port,
            demo: yamltree && "demo" in yamltree ? yamltree.demo : defaultConfig.demo,
            sessionMaxIdle: yamltree && "sessionMaxIdle" in yamltree ?
                ConfigLoader.readDuration(yamltree.sessionMaxIdle, defaultConfig.sessionMaxIdle) :
                defaultConfig.sessionMaxIdle,
            logHeaders: yamltree && "logHeaders" in yamltree ? yamltree.logHeaders : defaultConfig.logHeaders,
            
            ssl: {
                cert: yamltree && "ssl" in yamltree && "cert" in yamltree.ssl ? yamltree.ssl.cert : defaultConfig.ssl.cert,
                key: yamltree && "ssl" in yamltree && "key" in yamltree.ssl ? yamltree.ssl.key : defaultConfig.ssl.key
            },           
            allowInsecure: yamltree && "allowInsecure" in yamltree ? yamltree.allowInsecure : defaultConfig.allowInsecure,
            
            data: yamltree && "data" in yamltree ? yamltree.data : defaultConfig.data,
            cache: yamltree && "cache" in yamltree ? yamltree.cache : defaultConfig.cache,
            pdfconverter: yamltree && "pdfconverter" in yamltree ? yamltree.pdfconverter : defaultConfig.pdfconverter,
            
            register: yamltree && "register" in yamltree ? yamltree.register : defaultConfig.register,
            delay: yamltree && "delay" in yamltree ? ConfigLoader.readDuration(yamltree.delay, defaultConfig.delay) : defaultConfig.delay
        };
    }

    /**
     * Read a string as a duration with unit s, m, h or d (default: m) and return the result in milliseconds
     */
    protected static readDuration(str: string, defaultValue: number): number {
        let unit = str[str.length-1];
        let value: number;
        
        if(unit != "s" && unit != "m" && unit != "h" && unit != "d") {
            unit = "m";
            value = Number(str);
        } else {
            value = Number(str.substr(0, str.length-1));
        }
        if(isNaN(value)) return defaultValue;
        return value * (unit == "s" ? 1000 : unit == "m" ? 1000*60 : unit == "h" ? 1000*60*60 : 1000*60*60*24);
    }
}
