import express, {Router} from "express";
import {authMiddleware} from "@global/helpers/auth-middleware";
import {AddReactionController} from "@reaction/controllers/add-reactions";
import {DeleteReactionController} from "@reaction/controllers/remove-reaction";


class ReactionRoutes{
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router{

        this.router.post('/post/reaction', authMiddleware.checkAuthentication, AddReactionController.prototype.addReaction);

        this.router.delete('/post/reaction/:postId/:previousReaction/:postReactions', authMiddleware.checkAuthentication, DeleteReactionController.prototype.deleteReaction);


        return this.router;
    }

}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes();