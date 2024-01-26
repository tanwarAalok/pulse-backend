import {Application, json, urlencoded, Response, Request, NextFunction} from "express"
import * as http from "http";
import cors from "cors"
import helmet from "helmet";
import hpp from "hpp";
import compression from "compression"
import cookieSession from "cookie-session";
import HTTP_STATUS from "http-status-codes";
import "express-async-errors";
import {config} from '@root/config';
import {Server} from "socket.io"
import {createClient} from "redis";
import {createAdapter} from "@socket.io/redis-adapter";
import applicationRoutes from '@root/routes';
import {CustomError, IErrorResponse} from "@global/helpers/error-handler";
import Logger from 'bunyan';

const SERVER_PORT = 8000;
const log: Logger = config.createLogger('setupServer');
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
                keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
                maxAge: 24 * 7 * 3600 * 1000,
                secure: config.NODE_ENV !== "development"
            })
        )
        app.use(hpp()) // safety against HTTP Parameter Pollution attacks
        app.use(helmet()) // secure Express apps by setting HTTP response headers.
        app.use(
            cors({
                origin: config.CLIENT_URL,
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

    private routeMiddleware(app: Application): void {
        applicationRoutes(app);
    }

    private globalErrorHandler(app: Application): void {
        app.all("*", (req: Request, res: Response) => {
            res.status(HTTP_STATUS.NOT_FOUND).json({message: `${req.originalUrl} not found`})
        })

        app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
            log.error(error);
            if(error instanceof CustomError){
                return res.status(error.statusCode).json(error.serializeErrors());
            }
            next();
        })
    }
    private async startServer(app: Application): Promise<void> {
        try {
            const httpServer: http.Server = new http.Server(app);
            const socketIO: Server = await this.createSocketIO(httpServer);
            this.startHttpServer(httpServer);
            this.socketIOConnections(socketIO);
        } catch (error) {
            log.error(error)
        }
    }
    private async createSocketIO(httpServer: http.Server): Promise<Server> {
        const io: Server = new Server(httpServer, {
            cors: {
                origin: config.CLIENT_URL,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
            }
        })
        const pubClient = createClient({url: config.REDIS_HOST});
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        return io;
    }
    private startHttpServer(httpServer: http.Server): void {
        httpServer.listen(SERVER_PORT, () => {
            log.info(`SERVER RUNNING ON PORT ${SERVER_PORT}`)
        })
    }

    private socketIOConnections(io: Server) : void {
        log.info('SocketioConnections')
    }
}