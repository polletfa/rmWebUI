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
     * Register the application using the code provided in the form
     */
    registerApp() {
        const code = document.getElementById('code').value;
        if (code.match(/^[0-9a-z]{8}$/)) {
            document.getElementById("register-btn").disabled = true;
            const ui = this.ui;
            ui.apiRequest("../backend/api/register.php?code="+code, function(response) {
                if("status" in response) {
                    if(response["status"] !== "success") {
                        ui.showError("Unable to register the application.", response["error"]);
                    } else {
                        ui.getFiles();
                    }
                } else {
                    ui.showError("Invalid response from the cloud API.", response.toString());
                }
            }, function() {
                document.getElementById("register-btn").disabled = false;
            });
        } else {
            this.ui.showError("This isn't a valid code.", "The code must be exactly 8 alphanumerical characters.");
        }
    }
}
