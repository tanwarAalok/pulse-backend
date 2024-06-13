import express, {Router} from "express";
import {authMiddleware} from "@global/helpers/auth-middleware";
import {AddReactionController} from "@reaction/controllers/add-reactions";
import {DeleteReactionController} from "@reaction/controllers/remove-reaction";
import {GetReactionController} from "@reaction/controllers/get-reactions";


class ReactionRoutes{
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router{


        this.router.get('/post/reactions/:postId', authMiddleware.checkAuthentication, GetReactionController.prototype.getReactions);
        this.router.get('/post/reactions/username/:username', authMiddleware.checkAuthentication, GetReactionController.prototype.getReactionsByUsername);
        this.router.get('/post/single/reaction/:username/:postId', authMiddleware.checkAuthentication, GetReactionController.prototype.getSingleReactionByUsername);

        this.router.post('/post/reaction', authMiddleware.checkAuthentication, AddReactionController.prototype.addReaction);

        this.router.delete('/post/reaction/:postId/:previousReaction/:postReactions', authMiddleware.checkAuthentication, DeleteReactionController.prototype.deleteReaction);


        return this.router;
    }

}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes();