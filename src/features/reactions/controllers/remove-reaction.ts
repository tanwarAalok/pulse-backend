import {joiValidation} from "@global/decorators/joi-validation.decorator";
import { removeReactionSchema } from "@reaction/schemes/reactions";
import {Request, Response} from "express";
import { IReactionJob} from "@reaction/interfaces/reaction.interface";
import {ReactionCache} from "@service/redis/reaction.cache";
import HTTP_STATUS from "http-status-codes";
import {reactionQueue} from "@service/queues/reaction.queue";

const reactionCache: ReactionCache = new ReactionCache();

export class DeleteReactionController{
    @joiValidation(removeReactionSchema)
    public async deleteReaction(req: Request, res: Response){
        const {postId, previousReaction, postReactions} = req.params;

        await reactionCache.removePostReactionFromCache(postId, `${req.currentUser!.username}`, JSON.parse(postReactions));

        const dbReactionData: IReactionJob = {
            postId,
            username: req.currentUser!.username,
            previousReaction,
        };

        reactionQueue.addReactionJob('removePostReactionFromDB', dbReactionData);

        res.status(HTTP_STATUS.OK).json({message: 'Reaction removed from post'});
    }
}