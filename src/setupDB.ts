import mongoose from "mongoose";
import * as process from "process";
import {config} from '@root/config';
import Logger from 'bunyan';
import {redisConnection} from "@service/redis/redis.connection";

const log: Logger = config.createLogger('setupDB');
export default () => {
    const connect = () => {
        mongoose.connect(config.DB_URL!).then(() => {
            log.info("DB connected");
            redisConnection.connect()
        }).catch((error) => {
            log.error('Error connecting with the DB', error);
            return process.exit(1);
        })
    }

    connect();

    mongoose.connection.on('disconnected', connect);
}