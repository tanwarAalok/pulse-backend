import express, {Express} from "express";
import {PulseServer} from './setupServer'
import dbConnection from './setupDB';
import {config} from './config';
class Application {
    public initialize() : void {
        this.loadConfig();
        dbConnection();
        const app : Express = express();
        const server: PulseServer = new PulseServer(app);
        server.start();
    }

    private loadConfig() : void {
        config.validateConfig();
        config.cloudinaryConfig();
    }
}

const application: Application = new Application();
application.initialize();