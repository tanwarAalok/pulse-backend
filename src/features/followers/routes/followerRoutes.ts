import express, {Router} from "express";
import {authMiddleware} from "@global/helpers/auth-middleware";
import {FollowerController} from "@follower/controllers/follower-user";
import {UnfollowUserController} from "@follower/controllers/unfollow-user";

class FollowerRoutes{
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router{
        this.router.put('/user/follow/:followeeId', authMiddleware.checkAuthentication, FollowerController.prototype.follow);

        this.router.put('/user/unfollow/:followerId/:followeeId', authMiddleware.checkAuthentication, UnfollowUserController.prototype.unfollow);

        return this.router;
    }

}

export const followerRoutes: FollowerRoutes = new FollowerRoutes();