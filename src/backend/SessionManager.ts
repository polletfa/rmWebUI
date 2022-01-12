/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import * as uuid from "uuid";
import * as http from "http";

import { HTTPServer } from "./HTTPServer";

type Value = string|number|boolean;
type KeyValue = {key: string, value: Value};

interface Session {
    id: string,
    lastUsed: number;
    data: KeyValue[];
}

export class SessionManager {
    protected server: HTTPServer;
    protected sessions: Session[] = [];

    constructor(server: HTTPServer) {
        this.server = server;
        
        setInterval(this.clearOldSessions.bind(this), Math.min(60*1000, this.server.config.sessionMaxIdle)); // delete unused sessions regularly
    }
    
    public getOrCreateSession(request: http.IncomingMessage, response: http.ServerResponse): string {
        const cookie = request.headers?.cookie;
        if(cookie) {
            const match = cookie.match(/\bsessionId\s*=\s*([^\s;]*)/);
            if(match) {
                // session cookie found
                if(this.hasSession(match[1])) {
                    // session exists
                    this.server.log("Using existing session: "+match[1]);
                    return match[1];
                } else {
                    this.server.log("Invalid session: "+match[1]);
                }
            }
        }
        // no cookie - Create new session and set cookie
        const sessionId = this.newSession();
        response.setHeader('Set-Cookie', 'sessionId='+sessionId);
        return sessionId;
    }
    
    public newSession(): string {
        const session = {
            id: uuid.v4(),
            lastUsed: Date.now(),
            data: []
        };
        this.sessions.push(session);
        this.server.log("Created new session: "+session.id);
        return session.id;
    }

    public deleteSession(sessionId: string): void {
        this.sessions = this.sessions.filter((session:Session) => session.id != sessionId);
        this.server.log("Deleted session "+sessionId);
    }

    public hasSession(sessionId: string): boolean {
        return this.sessions.find((session:Session) => session.id == sessionId) != undefined;
    }
    
    public getValue(sessionId: string, key: string): Value|undefined {
        const session = this.sessions.find((session:Session) => session.id == sessionId);
        if(session) {
            session.lastUsed = Date.now();
            const keyValue = session.data.find((kv:KeyValue) => kv.key == key);
            if(keyValue) {
                return keyValue.value;
            } else {
                this.server.log("Session "+sessionId+": key '"+key+"' not found.");
                return undefined;
            }
        } else {
            this.server.log("Session "+sessionId+" not found.");
            return undefined;
        }
    }

    public setValue(sessionId: string, key: string, value: Value): boolean {
        const session = this.sessions.find((session:Session) => session.id == sessionId);
        if(session) {
            session.lastUsed = Date.now();
            const keyValue = session.data.find((kv:KeyValue) => kv.key == key);
            if(keyValue) {
                keyValue.value = value;
            } else {
                session.data.push({key: key, value: value});
            }
            this.server.log("Session "+sessionId+": '"+key+"' => '"+value+"'");
            return true;
        } else {
            this.server.log("Session "+sessionId+" not found.");
            return false;
        }
    }

    public clearOldSessions() {
        const nSessions = this.sessions.length;
        this.sessions = this.sessions.filter((session: Session) => session.lastUsed - Date.now() < this.server.config.sessionMaxIdle);
        if(this.sessions.length < nSessions) {
            this.server.log("Deleted " + (nSessions - this.sessions.length) + " session(s).");
        }
    }
}
