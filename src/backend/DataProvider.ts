/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as fs from "fs";

import { Constants } from "./Constants";
import { Server } from "./Server";

/**
 * Access to stored data
 */
export class DataProvider {
    readonly server: Server;

    constructor(server: Server) {
        this.server = server;
    }


    /**
     * Read the access token to the cloud
     *
     * @return Token (async)
     */
    public async readToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(this.server.config.data + "/" + Constants.TOKEN_FILE, (err: NodeJS.ErrnoException|null, data: Buffer|null) => {
                if(err) {
                    if(err.code == "ENOENT") { resolve(""); }
                    else                     { reject(err); }
                } else {
                    try {
                        const json = JSON.parse(data ? data.toString() : "");
                        if("token" in json) { resolve(json.token);                      }
                        else                { reject(new Error("Invalid token file.")); }
                    } catch(e) {
                        reject(e);
                    }
                }
            });
        });
    }

    /**
     * Write the access token to the cloud
     *
     * @param token Token
     * @return Promise (async)
     */
    public async writeToken(token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.server.config.data + "/" + Constants.TOKEN_FILE, JSON.stringify({token:token}), (err: Error|null) => {
                if(err) { reject(err); }
                else    { resolve();   }
            });
        });
    }

    /**
     * Create the data directory if it doesn't already exist.
     *
     * @return Promise (async)
     */
    public async createDataDir(): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.mkdir(this.server.config.data, (err:NodeJS.ErrnoException|null) => {
                if(err && err.code != "EEXIST") {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}
