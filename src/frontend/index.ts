import { Application } from './Application';
import { Config } from './Config';

// extend Window to add a reference to the Application instance
interface CustomWindow extends Window {
    application: Application;
}
declare let window: CustomWindow;
declare let config: Config; // created by the backend

// Launch the application
window.application = new Application(config);

