import { Application } from './Application';
import { Config } from './Config';

interface CustomWindow extends Window {
    application: Application;
}
declare let window: CustomWindow;
declare let config: Config; // created by the backend

window.application = new Application(config);

