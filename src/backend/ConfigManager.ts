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
import { Config } from "./Config";
import { Constants } from "./Constants";
import { FrontendConfig } from './Config';

export class ConfigManager {
    readonly backend: Backend;
    readonly config: Config;
    
    constructor(backend: Backend) {
        this.backend = backend;

        // eslint-disable-next-line
        const config = yaml.load(fs.readFileSync(process.argv[2] ? process.argv[2] : Constants.CONFIG_FILE, "utf8")) as any;
        this.config = {
            port: config && "port" in config ? config.port : Constants.DEFAULT_CONFIG.port,
            demo: config && "demo" in config ? config.demo : Constants.DEFAULT_CONFIG.demo,
            sessionMaxIdle: config && "sessionMaxIdle" in config ?
                this.readDuration(config.sessionMaxIdle, Constants.DEFAULT_CONFIG.sessionMaxIdle) :
                Constants.DEFAULT_CONFIG.sessionMaxIdle,
            
            data: config && "data" in config ? config.data : Constants.DEFAULT_CONFIG.data,
            cache: config && "cache" in config ? config.cache : Constants.DEFAULT_CONFIG.cache,
            pdfconverter: config && "pdfconverter" in config ? config.pdfconverter : Constants.DEFAULT_CONFIG.pdfconverter,

            register: config && "register" in config ? config.register : Constants.DEFAULT_CONFIG.register,
            delay: config && "delay" in config ? this.readDuration(config.delay, Constants.DEFAULT_CONFIG.delay) : Constants.DEFAULT_CONFIG.delay,
            
            ssl: {
                cert: config && "ssl" in config && "cert" in config.ssl ? config.ssl.cert : Constants.DEFAULT_CONFIG.ssl.cert,
                key: config && "ssl" in config && "key" in config.ssl ? config.ssl.key : Constants.DEFAULT_CONFIG.ssl.key
            }
        };
    }

    public getFrontendConfig(): FrontendConfig {
        return {
            demo: this.config.demo,
            sessionId: this.backend.sessionManager.newSession(),
            formats: this.config.pdfconverter.trim().length == 0 ? [ "zip", "pdf" ] : [ "zip" ],
            register: this.config.register
        };
    }

    /**
     * Read a string as a duration with unit s, m, h or d (default: m) and return the result in milliseconds
     */
    protected readDuration(str: string, defaultValue: number): number {
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
