import express, {Router} from "express";
import {authMiddleware} from "@global/helpers/auth-middleware";
import {CreatePostController} from "@post/controllers/create-post";

class PostRoutes{
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router{
        this.router.post('/post', authMiddleware.checkAuthentication, CreatePostController.prototype.createPost);
        this.router.post('/post/image', authMiddleware.checkAuthentication, CreatePostController.prototype.createPostWithImage);
        return this.router;
    }

}

export const postRoutes: PostRoutes = new PostRoutes();