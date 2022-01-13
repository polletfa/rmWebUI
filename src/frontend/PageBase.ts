/*****************************************************
 *
 * rmWebUI - Web interface for the reMarkable(R) cloud.
 *
 * (c) 2021-2022 Fabien Pollet <polletfa@posteo.de>
 * MIT License (see LICENSE.md file)
 *
 *****************************************************/

import { FrontendApplication } from "./FrontendApplication";

/**
 * Base for all pages
 */
export abstract class PageBase {
    readonly ui: FrontendApplication;

    /**
     * @param ui Main class
     */
    constructor(ui: FrontendApplication) {
        this.ui = ui; /**< main class */
    }

    /**
     * Method called when the page is shown
     */
    public abstract showPage(): void;
}
