import { Request, Response, NextFunction } from 'express';
import JWT from "jsonwebtoken";
import {config} from "@root/config";
import {UnauthorizedError} from "@global/helpers/error-handler";
import {AuthPayload} from "@auth/interfaces/auth.interface";


export class AuthMiddleware {
    public verifyUser(req: Request, res: Response, next: NextFunction): void {
        if(!req.session?.jwt){
            throw new UnauthorizedError('Token is not available. Please login again.');
        }

        try{
            const payload: AuthPayload = JWT.verify(req.session?.jwt, config.JWT_TOKEN!) as AuthPayload;
            req.currentUser = payload;
        }
        catch(error){
            throw new UnauthorizedError('Token is invalid. Please login again.');
        }

        next();
    }

    public checkAuthentication(req: Request, res: Response, next: NextFunction): void {
        if(!req.currentUser){
            throw new UnauthorizedError('User is not logged in. Please login again.');
        }
        next();
    }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();