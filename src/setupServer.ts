import {Application, json, urlencoded, Response, Request, NextFunction} from "express"
import * as http from "http";
import cors from "cors"
import helmet from "helmet";
import hpp from "hpp";
import compression from "compression"
import cookieSession from "cookie-session";
import HTTP_STATUS from "http-status-codes";
import "express-async-errors";

const SERVER_PORT = 8000;
export class PulseServer{
    private app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    public start() : void {
        this.securityMiddleware(this.app);
        this.standardMiddleware(this.app);
        this.routeMiddleware(this.app);
        this.globalErrorHandler(this.app);
        this.startServer(this.app);
    }

    private securityMiddleware(app: Application): void {
        app.use(
            cookieSession({
                name: 'session',
                keys: ['test1', 'test2'],
                maxAge: 24 * 7 * 3600 * 1000,
                secure: false
            })
        )
        app.use(hpp()) // safety against HTTP Parameter Pollution attacks
        app.use(helmet()) // secure Express apps by setting HTTP response headers.
        app.use(
            cors({
                origin: '*',
                credentials: true,
                optionsSuccessStatus: 200,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
            })
        )
    }

    private standardMiddleware(app: Application): void {
        app.use(compression())  // compress response bodies
        app.use(json({limit: '50mb'}));
        app.use(urlencoded({extended: true, limit: '50mb'}))
    }

    private routeMiddleware(app: Application): void {}

    private globalErrorHandler(app: Application): void {}
    private startServer(app: Application): void {
        try{
            const httpServer: http.Server = new http.Server(app);
            this.startHttpServer(httpServer);
        }
        catch (e) {
            console.log(e)
        }
    }
    private createSocketIO(httpServer: http.Server): void {}
    private startHttpServer(httpServer: http.Server): void {
        httpServer.listen(SERVER_PORT, () => {
            console.log(`SERVER RUNNING ON PORT ${SERVER_PORT}`)
        })
    }
}