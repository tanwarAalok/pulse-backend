import {ObjectId} from "mongodb";
import mongoose from "mongoose";
import {FollowerModel} from "@follower/models/follower.schema";
import {UserModel} from "@user/models/user.schema";
import {IFollowerData} from "@follower/interfaces/follower.interface";

class FollowerService {

    public async addFollowerToDB(userId: string, followeeId: string, username: string, documentObjectId: ObjectId): Promise<void> {
        const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);
        const followerObjectId: ObjectId = new mongoose.Types.ObjectId(userId);

        await FollowerModel.create({
            _id: documentObjectId,
            followeeId: followeeObjectId,
            followerId: followerObjectId
        })

        const users = UserModel.bulkWrite([
            {
                updateOne: {
                    filter: { _id: userId },
                    update: { $inc: { followingCount: 1 } }
                }
            },
            {
                updateOne: {
                    filter: { _id: followeeId },
                    update: { $inc: { followersCount: 1 } }
                }
            }
        ])

        await Promise.all([users, UserModel.findOne({_id: followeeId})]);
    }

    public async removeFollowerFromDB(followerId: string, followeeId: string): Promise<void> {

        const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);
        const followerObjectId: ObjectId = new mongoose.Types.ObjectId(followerId);

        const unfollow =  FollowerModel.deleteOne({
            followeeId: followeeObjectId,
            followerId: followerObjectId
        })

        const users = UserModel.bulkWrite([
            {
                updateOne: {
                    filter: { _id: followerId },
                    update: { $inc: { followingCount: -1 } }
                }
            },
            {
                updateOne: {
                    filter: { _id: followeeId },
                    update: { $inc: { followersCount: -1 } }
                }
            }
        ])

        await Promise.all([unfollow, users]);
    }

    public async getFolloweeData(userObjectId: ObjectId): Promise<IFollowerData[]> {
        const followee = await FollowerModel.aggregate([
            { $match: { followerId: userObjectId } },
            { $lookup: { from: 'User', localField: 'followeeId', foreignField: '_id', as: 'followeeId' } },
            { $unwind: '$followeeId' },
            { $lookup: { from: 'Auth', localField: 'followeeId.authId', foreignField: '_id', as: 'authId' } },
            { $unwind: '$authId' },
            {
                $addFields: {
                    _id: '$followeeId._id',
                    username: '$authId.username',
                    avatarColor: '$authId.avatarColor',
                    postCount: '$followeeId.postsCount',
                    followersCount: '$followeeId.followersCount',
                    followingCount: '$followeeId.followingCount',
                    profilePicture: '$followeeId.profilePicture',
                    uId: '$authId.uId',
                    userProfile: '$followeeId',
                }
            },
            {
                $project: {
                    authId: 0,
                    followerId: 0,
                    followeeId: 0,
                    createdAt: 0,
                    __v: 0
                }
            }
        ])

        return followee;
    }

    public async getFollowerData(userObjectId: ObjectId): Promise<IFollowerData[]> {
        const follower = await FollowerModel.aggregate([
            { $match: { followeeId: userObjectId } },
            { $lookup: { from: 'User', localField: 'followerId', foreignField: '_id', as: 'followerId' } },
            { $unwind: '$followerId' },
            { $lookup: { from: 'Auth', localField: 'followerId.authId', foreignField: '_id', as: 'authId' } },
            { $unwind: '$authId' },
            {
                $addFields: {
                    _id: '$followerId._id',
                    username: '$authId.username',
                    avatarColor: '$authId.avatarColor',
                    postCount: '$followerId.postsCount',
                    followersCount: '$followerId.followersCount',
                    followingCount: '$followerId.followingCount',
                    profilePicture: '$followerId.profilePicture',
                    uId: '$authId.uId',
                    userProfile: '$followerId',
                }
            },
            {
                $project: {
                    authId: 0,
                    followerId: 0,
                    followeeId: 0,
                    createdAt: 0,
                    __v: 0
                }
            }
        ])

        return follower;
    }
}

export const followerService: FollowerService = new FollowerService();