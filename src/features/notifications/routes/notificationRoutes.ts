import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/auth-middleware';
import {GetNotificationController} from "@notification/controllers/get-notification";
import {UpdateNotificationController} from "@notification/controllers/update-notification";
import {DeleteNotificationController} from "@notification/controllers/delete-notification";

class NotificationRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {

        this.router.get('/notifications', authMiddleware.checkAuthentication, GetNotificationController.prototype.getNotifications);
        this.router.put('/notification/:notificationId', authMiddleware.checkAuthentication, UpdateNotificationController.prototype.update);
        this.router.delete('/notification/:notificationId', authMiddleware.checkAuthentication, DeleteNotificationController.prototype.delete);

        return this.router;
    }
}

export const notificationRoutes: NotificationRoutes = new NotificationRoutes();