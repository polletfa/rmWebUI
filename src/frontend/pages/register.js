/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE file)
 *
 *****************************************************/

/**
 * Page "register"
 */
class rmWebUIRegister {
    constructor(ui) {
        this.ui = ui; /**< main class */
    }

    /**
     * Method called when the page is shown
     */
    showPage() {
        this.ui.setTitle();
        this.ui.showRefresh(false);
        document.getElementById('code').focus();
    }
    
    /**
     * Register the application using the code provided in the form
     */
    registerApp() {
        const code = document.getElementById('code').value;
        if (code.match(/^[0-9a-zA-Z]{8}$/)) {
            document.getElementById("register-btn").disabled = true;
            this.ui.apiRequest("../backend/api/register.php?code="+code, true, (response) => {
                if("status" in response) {
                    if(response["status"] !== "success") {
                        this.ui.showError("Unable to register the application.", response["error"]);
                    } else {
                        this.ui.getFiles();
                        this.ui.show('content-register', false);
                    }
                } else {
                    this.ui.showError("Invalid response from the cloud API.", response.toString());
                }
            }, function() {
                document.getElementById("register-btn").disabled = false;
            });
        } else {
            this.ui.showError("This isn't a valid code.", "The code must be exactly 8 alphanumerical characters.");
        }
    }

    /**
     * Called when ENTER is pressed while inside the "code" input field
     */
    enterCode(event) {
        if(event.keyCode==13) {
            document.getElementById('register-btn').click();
            document.getElementById('code').value = '';
        }
    }
}
