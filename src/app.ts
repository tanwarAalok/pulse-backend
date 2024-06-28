import express, {Express} from "express";
import {PulseServer} from './setupServer'
import dbConnection from './setupDB';
import {config} from './config';
import Logger from "bunyan";
import * as process from "node:process";

const log: Logger = config.createLogger('app');

class Application {
    public initialize() : void {
        this.loadConfig();
        dbConnection();
        const app : Express = express();
        const server: PulseServer = new PulseServer(app);
        server.start();
        Application.handleExit()
    }

    private loadConfig() : void {
        config.validateConfig();
        config.cloudinaryConfig();
    }

    private static handleExit(): void {
        process.on('uncaughtException', (error: Error) => {
            log.error(`There was an uncaught error: ${error}`);
            Application.shutDownProperly(1);
        })

        process.on('unhandledRejection', (error: Error) => {
            log.error(`Unhandled rejection at promise: ${error}`);
            Application.shutDownProperly(2);
        })

        process.on('SIGTERM', (error: Error) => {
            log.error(`Caught SIGTERM: ${error}`);
            Application.shutDownProperly(2);
        })

        process.on('SIGINT', (error: Error) => {
            log.error(`Caught SIGINT: ${error}`);
            Application.shutDownProperly(2);
        })

        process.on('exit', (error: Error) => {
            log.error('Exiting');
        })
    }

    private static shutDownProperly(exitCode: number): void {
        Promise.resolve()
            .then(() => {
                log.info('Shutdown complete')
                process.exit(exitCode);
            })
            .catch((error) => {
                log.error(`Error during shutdown: ${error}`);
                process.exit(1);
            })
    }
}

const application: Application = new Application();
application.initialize();