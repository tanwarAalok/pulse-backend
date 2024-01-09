import mongoose from "mongoose";
import * as process from "process";
import {config} from './config';

export default () => {
    const connect = () => {
        mongoose.connect(config.DB_URL!).then(() => {
            console.log("DB connected");
        }).catch((error) => {
            console.log('Error connecting with the DB', error);
            return process.exit(1);
        })
    }

    connect();

    mongoose.connection.on('disconnected', connect);
}