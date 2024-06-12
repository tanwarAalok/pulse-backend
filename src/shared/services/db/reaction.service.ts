import {IReactionDocument, IReactionJob} from "@reaction/interfaces/reaction.interface";
import {UserCache} from "@service/redis/user.cache";
import {ReactionModel} from "@reaction/models/reaction.schema";
import {PostModel} from "@post/models/post.schema";
import {IUserDocument} from "@user/interfaces/user.interface";
import {IPostDocument} from "@post/interfaces/post.interface";
import {omit} from "lodash";

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
}

export const reactionService: ReactionService = new ReactionService();