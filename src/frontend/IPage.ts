/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import { Application } from "./Application";

/**
 * Base for all pages
 */
export abstract class IPage {
    readonly ui: Application;

    /**
     * @param ui Main class
     */
    constructor(ui: Application) {
        this.ui = ui; /**< main class */
    }

    /**
     * Method called when the page is shown
     */
    public abstract showPage(): void;
}
