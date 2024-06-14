import express, {Router} from "express";
import {authMiddleware} from "@global/helpers/auth-middleware";
import {GetCommentController} from "@comment/controllers/get-comment";
import {AddCommentController} from "@comment/controllers/add-comment";


class CommentRoutes{
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router{


        this.router.get('/post/comments/:postId', authMiddleware.checkAuthentication, GetCommentController.prototype.comments);
        this.router.get('/post/commentsnames/:postId', authMiddleware.checkAuthentication, GetCommentController.prototype.commentNames);
        this.router.get('/post/comment/:postId/:commentId', authMiddleware.checkAuthentication, GetCommentController.prototype.singleComment);

        this.router.post('/post/comment', authMiddleware.checkAuthentication, AddCommentController.prototype.comment);



        return this.router;
    }

}

export const commentRoutes: CommentRoutes = new CommentRoutes();