import express, {Router} from "express";
import {authMiddleware} from "@global/helpers/auth-middleware";
import {FollowerController} from "@follower/controllers/follower-user";
import {UnfollowUserController} from "@follower/controllers/unfollow-user";
import {GetFollowersController} from "@follower/controllers/get-followers";
import {BlockUserController} from "@follower/controllers/block-user";

class FollowerRoutes{
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router{

        this.router.get('/user/following', authMiddleware.checkAuthentication, GetFollowersController.prototype.userFollowings);
        this.router.get('/user/followers/:userId', authMiddleware.checkAuthentication, GetFollowersController.prototype.userFollowers);

        this.router.put('/user/follow/:followeeId', authMiddleware.checkAuthentication, FollowerController.prototype.follow);
        this.router.put('/user/unfollow/:followerId/:followeeId', authMiddleware.checkAuthentication, UnfollowUserController.prototype.unfollow);

        this.router.put('/user/block/:followerId', authMiddleware.checkAuthentication, BlockUserController.prototype.block);
        this.router.put('/user/unblock/:followerId', authMiddleware.checkAuthentication, BlockUserController.prototype.unblock);

        return this.router;
    }

}

export const followerRoutes: FollowerRoutes = new FollowerRoutes();