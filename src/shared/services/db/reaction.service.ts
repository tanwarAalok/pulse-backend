import {IQueryReaction, IReactionDocument, IReactionJob} from "@reaction/interfaces/reaction.interface";
import {UserCache} from "@service/redis/user.cache";
import {ReactionModel} from "@reaction/models/reaction.schema";
import {PostModel} from "@post/models/post.schema";
import {omit} from "lodash";
import mongoose from "mongoose";
import {Helpers} from "@global/helpers/helpers";

const userCache: UserCache = new UserCache();

class ReactionService{
    public async addReactionToDB(reactionData: IReactionJob): Promise<void> {
        const { postId, userTo, userFrom, username, type, previousReaction, reactionObject} = reactionData;

        let updatedReactionObject: IReactionDocument = reactionObject as IReactionDocument;
        if(previousReaction) {
            updatedReactionObject = omit(reactionObject, ['_id']);
        }

        const updatedReaction = await Promise.all([
            userCache.getUserFromCache(`${userTo}`),
            ReactionModel.replaceOne({ postId, type: previousReaction, username}, updatedReactionObject, { upsert: true }),
            PostModel.findOneAndUpdate(
                { _id: postId },
                { $inc : {
                        [`reactions.${previousReaction}`]: -1,
                        [`reactions.${type}`]: 1,
                    }
                },
                { new: true }
            )
        ])

        //TODO: send reaction notification
    }

    public async deleteReactionFromDB(reactionData: IReactionJob): Promise<void> {
        const {postId, previousReaction, username} = reactionData;
        await Promise.all([
            ReactionModel.deleteOne({ postId, type: previousReaction, username }),
            PostModel.findOneAndUpdate(
                { _id: postId },
                { $inc : {
                        [`reactions.${previousReaction}`]: -1,
                    }
                },
                { new: true }
            )
        ])
    }

    public async getPostReactions(query: IQueryReaction, sort: Record<string, 1 | -1>): Promise<[IReactionDocument[], number]>{
        const reactions: IReactionDocument[] = await ReactionModel.aggregate([
            { $match: query },
            { $sort: sort }
        ]);
        return [reactions, reactions.length];
    }

    public async getSinglePostReactionByUsername(postId: string, username: string): Promise<[IReactionDocument, number] | []>{
        const reactions: IReactionDocument[] = await ReactionModel.aggregate([
            { $match: { postId: new mongoose.Types.ObjectId(postId), username: Helpers.firstLetterUpperCase(username) }},
        ]);
        return reactions.length ? [reactions[0], 1] : [];
    }

    public async getReactionsByUsername(username: string): Promise<IReactionDocument[]>{
        const reactions: IReactionDocument[] = await ReactionModel.aggregate([
            { $match: { username: Helpers.firstLetterUpperCase(username) }},
        ]);
        return reactions;
    }
}

export const reactionService: ReactionService = new ReactionService();