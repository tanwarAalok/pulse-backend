import {Request, Response} from "express";
import {FollowerCache} from "@service/redis/follower.cache";
import {UserCache} from "@service/redis/user.cache";
import {IUserDocument} from "@user/interfaces/user.interface";
import {IFollowerData} from "@follower/interfaces/follower.interface";
import mongoose from "mongoose";
import {ObjectId} from "mongodb";
import HTTP_STATUS from "http-status-codes";
import {socketIOFollowerObject} from "@socket/follower.socket";
import {followerQueue} from "@service/queues/follower.queue";

const followerCache: FollowerCache = new FollowerCache();
const userCache: UserCache = new UserCache();

export class FollowerController {

    public async follow(req: Request, res: Response): Promise<void> {
        const { followeeId } = req.params;

        const followeeCount: Promise<void> = followerCache.updateFollowerCountInCache(`${followeeId}`, 'followersCount', 1);
        const followerCount: Promise<void> =  followerCache.updateFollowerCountInCache(`${req.currentUser!.userId}`, 'followingCount', 1);
        await Promise.all([followerCount, followeeCount]);

        const cachedFollowee: Promise<IUserDocument> = userCache.getUserFromCache(followeeId) as Promise<IUserDocument>;
        const cachedFollower: Promise<IUserDocument> = userCache.getUserFromCache(`${req.currentUser!.userId}`) as Promise<IUserDocument>;
        const response: [IUserDocument, IUserDocument] = await Promise.all([cachedFollower, cachedFollowee]);

        const documentObjectId: ObjectId = new ObjectId();
        const addFolloweeData: IFollowerData = FollowerController.prototype.userData(response[0]);
        socketIOFollowerObject.emit('add follower', addFolloweeData);

        const addFollowerToCache: Promise<void> = followerCache.saveFollowerToCache(`followers:${followeeId}`, `${req.currentUser!.userId}`);
        const addFolloweeToCache: Promise<void> = followerCache.saveFollowerToCache(`followings:${req.currentUser!.userId}`, `${followeeId}`);
        await Promise.all([addFollowerToCache, addFolloweeToCache]);

        followerQueue.addFollowerJob('addFollowerToDb', {
            keyOne: `${req.currentUser!.userId}`,
            keyTwo: `${followeeId}`,
            username: req.currentUser!.username,
            followerDocumentId: documentObjectId
        })

        res.status(HTTP_STATUS.OK).json({message: 'Following user now'});
    }

    private userData(user: IUserDocument): IFollowerData {
        return {
            _id: new mongoose.Types.ObjectId(user._id),
            username: user.username!,
            avatarColor: user.avatarColor!,
            postCount: user.postsCount,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
            profilePicture: user.profilePicture,
            uId: user.uId!,
            userProfile: user
        }
    }
}