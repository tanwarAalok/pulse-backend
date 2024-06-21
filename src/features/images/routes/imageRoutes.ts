import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/auth-middleware';
import {GetImagesController} from "@image/controllers/get-images";
import {AddImageController} from "@image/controllers/add-image";
import {DeleteImageController} from "@image/controllers/delete-image";

class ImageRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.get('/images/:userId', authMiddleware.checkAuthentication, GetImagesController.prototype.images);
        this.router.post('/images/profile', authMiddleware.checkAuthentication, AddImageController.prototype.profileImage);
        this.router.post('/images/background', authMiddleware.checkAuthentication, AddImageController.prototype.backgroundImage);
        this.router.delete('/images/:imageId', authMiddleware.checkAuthentication, DeleteImageController.prototype.image);
        this.router.delete('/images/background/:bgImageId', authMiddleware.checkAuthentication, DeleteImageController.prototype.backgroundImage);

        return this.router;
    }
}

export const imageRoutes: ImageRoutes = new ImageRoutes();