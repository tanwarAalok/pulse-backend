import {joiValidation} from "@global/decorators/joi-validation.decorator";
import {addCommentSchema} from "@comment/schemes/comment";
import {Response, Request} from "express";
import HTTP_STATUS from "http-status-codes";
import {ObjectId} from "mongodb";
import {ICommentDocument, ICommentJob, ICommentNameList} from "@comment/interfaces/comment.interface";
import {CommentCache} from "@service/redis/comment.cache";
import {commentQueue} from "@service/queues/comment.queue";
import {commentService} from "@service/db/comment.service";
import mongoose from "mongoose";

const commentCache: CommentCache = new CommentCache();

export class GetCommentController {

    public async comments(req: Request, res: Response): Promise<void> {
        const {postId} = req.params;

        const cachedComments: ICommentDocument[] = await commentCache.getCommentsFromCache(postId);
        const comments: ICommentDocument[] = cachedComments.length
            ? cachedComments :
            await commentService.getPostComments({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });


        res.status(HTTP_STATUS.OK).json({message: 'Post comments', comments});
    }

    public async commentNames(req: Request, res: Response): Promise<void> {
        const {postId} = req.params;

        const cachedCommentsNames: ICommentNameList[] = await commentCache.getCommentsNamesFromCache(postId);
        const commentsNames: ICommentNameList[] = cachedCommentsNames.length
            ? cachedCommentsNames :
            await commentService.getPostCommentNames({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });


        res.status(HTTP_STATUS.OK).json({message: 'Post comments names', comments: commentsNames.length ? commentsNames[0] : []});
    }

    public async singleComment(req: Request, res: Response): Promise<void> {
        const {postId, commentId} = req.params;

        const cachedComment: ICommentDocument[] = await commentCache.getSingleCommentFromCache(postId, commentId);
        const comments: ICommentDocument[] = cachedComment.length
            ? cachedComment :
            await commentService.getPostComments({ _id: new mongoose.Types.ObjectId(commentId) }, { createdAt: -1 });


        res.status(HTTP_STATUS.OK).json({message: 'Single comment', comments: comments[0]});
    }
}