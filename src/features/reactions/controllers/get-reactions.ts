import {Request, Response} from "express";
import {IReactionDocument, IReactionJob} from "@reaction/interfaces/reaction.interface";
import {ReactionCache} from "@service/redis/reaction.cache";
import HTTP_STATUS from "http-status-codes";
import {reactionService} from "@service/db/reaction.service";
import mongoose from "mongoose";

const reactionCache: ReactionCache = new ReactionCache();

export class GetReactionController{

    public async getReactions(req: Request, res: Response){
        const {postId} = req.params;

        const cachedReactions: [IReactionDocument[], number] = await reactionCache.getReactionsFromCache(postId);
        const reactions: [IReactionDocument[], number] = cachedReactions[0].length ? cachedReactions :
            await reactionService.getPostReactions({postId: new mongoose.Types.ObjectId(postId)}, { createdAt: -1 });

        res.status(HTTP_STATUS.OK).json({message: 'Post reactions', reactions: reactions[0], count: reactions[1]});
    }

    public async getSingleReactionByUsername(req: Request, res: Response){
        const {postId, username} = req.params;

        const cachedReactions: [IReactionDocument, number] | [] = await reactionCache.getSingleReactionByUsernameFromCache(postId, username);
        const reactions: [IReactionDocument, number] | [] = cachedReactions.length ? cachedReactions :
            await reactionService.getSinglePostReactionByUsername(postId, username);

        res.status(HTTP_STATUS.OK).json({message: 'Single post reaction by username', reaction: reactions.length ? reactions[0] : {}, count: reactions.length ? reactions[1] : 0});
    }

    public async getReactionsByUsername(req: Request, res: Response){
        const { username} = req.params;

        const reactions: IReactionDocument[] = await reactionService.getReactionsByUsername(username);

        res.status(HTTP_STATUS.OK).json({message: 'All user reactions by username', reactions });
    }
}