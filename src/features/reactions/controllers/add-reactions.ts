import {joiValidation} from "@global/decorators/joi-validation.decorator";
import {addReactionSchema} from "@reaction/schemes/reactions";
import {Request, Response} from "express";
import {IReactionDocument, IReactionJob} from "@reaction/interfaces/reaction.interface";
import {ReactionCache} from "@service/redis/reaction.cache";
import HTTP_STATUS from "http-status-codes";
import {reactionQueue} from "@service/queues/reaction.queue";

const reactionCache: ReactionCache = new ReactionCache();

export class AddReactionController{
    @joiValidation(addReactionSchema)
    public async addReaction(req: Request, res: Response){
        const {userTo, postId, type, previousReaction, postReactions, profilePicture} = req.body;
        const reactionObject: IReactionDocument = {
            postId,
            type,
            avatarColor: req.currentUser!.avatarColor,
            username: req.currentUser!.username,
            profilePicture
        } as IReactionDocument;

        await reactionCache.savePostReactionToCache(postId, reactionObject, postReactions, type, previousReaction);

        const dbReactionData: IReactionJob = {
            postId,
            userTo,
            userFrom: req.currentUser!.userId,
            username: req.currentUser!.username,
            type,
            previousReaction,
            reactionObject
        };

        reactionQueue.addReactionJob('addPostReactionToDB', dbReactionData);

        res.status(HTTP_STATUS.OK).json({message: 'Reaction added successfully'});
    }
}