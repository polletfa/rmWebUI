import { Application } from './Application';

// extend Window to add a reference to the Application instance
interface CustomWindow extends Window {
    application: Application;
}
declare let window: CustomWindow;

// Launch the application
window.application = new Application();

