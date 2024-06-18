import {ObjectId} from "mongodb";
import mongoose from "mongoose";
import {FollowerModel} from "@follower/models/follower.schema";
import {UserModel} from "@user/models/user.schema";

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
}

export const followerService: FollowerService = new FollowerService();