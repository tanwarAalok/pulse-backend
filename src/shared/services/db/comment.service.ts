import {ICommentDocument, ICommentJob, ICommentNameList, IQueryComment} from "@comment/interfaces/comment.interface";
import {CommentsModel} from "@comment/models/comment.schema";
import {PostModel} from "@post/models/post.schema";
import {Query} from "mongoose";
import {IPostDocument} from "@post/interfaces/post.interface";
import {UserCache} from "@service/redis/user.cache";
import {IUserDocument} from "@user/interfaces/user.interface";

const userCache: UserCache = new UserCache();

class CommentService {
    public async addCommentToDB(commentData: ICommentJob): Promise<void> {
        const {postId, userTo, userFrom, username, comment} = commentData;
        const comments: Promise<ICommentDocument> = CommentsModel.create(comment);
        const post: Query<IPostDocument | null, IPostDocument, {}, IPostDocument, "findOneAndUpdate"> = PostModel.findOneAndUpdate(
            { _id: postId },
            { $inc: { commentsCount: 1 }},
            { new: true },
        )
        const user: Promise<IUserDocument> = userCache.getUserFromCache(userTo) as Promise<IUserDocument>;
        await Promise.all([
            comments,
            post,
            user
        ])

        // send comments notification
    }

    public async getPostComments(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> {
        const comments: ICommentDocument[] = await CommentsModel.aggregate([
            { $match: query },
            { $sort: sort }
        ])

       return comments;
    }

    public async getPostCommentNames(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentNameList[]> {
        const commentNames: ICommentNameList[] = await CommentsModel.aggregate([
            { $match: query },
            { $sort: sort },
            { $group: { _id: null, names: { $addToSet: '$username' }, count: { $sum: 1 } } },
            { $project: { _id: 0 }}
        ])

        return commentNames;
    }
}

export const commentService: CommentService = new CommentService();