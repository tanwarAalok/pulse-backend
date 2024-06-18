import {Request, Response} from "express";
import {FollowerCache} from "@service/redis/follower.cache";
import {followerQueue} from "@service/queues/follower.queue";
import HTTP_STATUS from "http-status-codes";

const followerCache: FollowerCache = new FollowerCache();

export class UnfollowUserController{

    public async unfollow(req: Request, res: Response): Promise<void> {
        const {followerId, followeeId} = req.params;

        const removeFollowingFromCache: Promise<void> = followerCache.removeFollowerFromCache(`followings:${followerId}`, followeeId);
        const removeFollowerFromCache: Promise<void> = followerCache.removeFollowerFromCache(`followers:${followeeId}`, followerId);

        const followersCount: Promise<void> = followerCache.updateFollowerCountInCache(`${followerId}`, 'followingCount', -1);
        const followingCount: Promise<void> = followerCache.updateFollowerCountInCache(`${followeeId}`, 'followersCount', -1);

        await Promise.all([removeFollowerFromCache, removeFollowingFromCache, followersCount, followingCount]);

        followerQueue.addFollowerJob('removeFollowerFromDb', {
            keyOne: `${followerId}`,
            keyTwo: `${followeeId}`,
        })

        res.status(HTTP_STATUS.OK).json({message: 'Unfollowed user now'});

    }
}