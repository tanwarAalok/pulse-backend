import express, {Express} from "express";
import {PulseServer} from './setupServer'
class Application {
    public initialize() : void {
        const app : Express = express();
        const server: PulseServer = new PulseServer(app);
        server.start();
    }
}

const application: Application = new Application();
application.initialize();