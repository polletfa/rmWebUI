/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import { FrontendApplication } from "./FrontendApplication";
import { PageBase } from "./PageBase";
import { APIRequest } from "./APIRequest";

import { APIResponseStatus } from "../backend/types/API";

/**
 * Page "register"
 */
export class RegisterPage extends PageBase {
    constructor(ui: FrontendApplication) {
        super(ui);
    }

    /**
     * Method called when the page is shown
     */
    public showPage(): void {
        this.ui.layout.setTitle();
        this.ui.layout.showRefresh(false);
        const el = document.getElementById('code');
        if(el instanceof HTMLElement) el.focus();
    }
    
    /**
     * Register the application using the code provided in the form
     */
    public registerApp(): void {
        this.ui.layout.show('error-banner', false);
        const codeEl = document.getElementById("code");
        const code = (codeEl instanceof HTMLInputElement) ? codeEl.value : "";
        if (code.match(/^[0-9a-zA-Z]{8}$/)) {
            const registerBtn = document.getElementById("register-btn");
            if(registerBtn instanceof HTMLButtonElement) registerBtn.disabled = true;
            
            new APIRequest(this.ui, "/cloud/register?code="+code)
                .onReceiveJSON((response) => {
                    if(response.status !== APIResponseStatus.Success) {
                        this.ui.layout.showError("Unable to register the application.", response["error"] ? response["error"] : "Unknown error");
                    } else {
                        this.ui.getFiles();
                        this.ui.layout.show('content-register', false);
                    }
                })
                .onFinish(() => {
                    if(registerBtn instanceof HTMLButtonElement) registerBtn.disabled = false;
                });
        } else {
            this.ui.layout.showError("This isn't a valid code.", "The code must be exactly 8 alphanumerical characters.");
        }
    }

    /**
     * Called when ENTER is pressed while inside the "code" input field
     */
    public enterCode(event: Event): void {
        if(event instanceof KeyboardEvent && event.keyCode==13) {
            const registerBtn = document.getElementById('register-btn');
            if(registerBtn instanceof HTMLButtonElement) registerBtn.click();

            const codeEl = document.getElementById('code');
            if(codeEl instanceof HTMLInputElement) codeEl.value = "";
        }
    }
}
