import express, {Router} from "express";
import {authMiddleware} from "@global/helpers/auth-middleware";
import {CreatePostController} from "@post/controllers/create-post";
import {GetPostController} from "@post/controllers/get-posts";
import {DeletePostController} from "@post/controllers/delete.post";
import {UpdatePostController} from "@post/controllers/update-post";

class PostRoutes{
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router{

        this.router.get('/post/all/:page', authMiddleware.checkAuthentication, GetPostController.prototype.posts);
        this.router.get('/post/image/:page', authMiddleware.checkAuthentication, GetPostController.prototype.postsWithImage);

        this.router.post('/post', authMiddleware.checkAuthentication, CreatePostController.prototype.createPost);
        this.router.post('/post/image', authMiddleware.checkAuthentication, CreatePostController.prototype.createPostWithImage);

        this.router.delete('/post/:postId', authMiddleware.checkAuthentication, DeletePostController.prototype.deletePost);

        this.router.put('/post/:postId', authMiddleware.checkAuthentication, UpdatePostController.prototype.updatePost);
        this.router.put('/post/image/:postId', authMiddleware.checkAuthentication, UpdatePostController.prototype.updatePostWithImage);

        return this.router;
    }

}

export const postRoutes: PostRoutes = new PostRoutes();