import {IGetPostsQuery, IPostDocument} from "@post/interfaces/post.interface";
import {PostModel} from "@post/models/post.schema";
import {UpdateQuery} from "mongoose";
import {IUserDocument} from "@user/interfaces/user.interface";
import {UserModel} from "@user/models/user.schema";

class PostService {
    public async addPostToDB(userId: string, createdPost: IPostDocument): Promise<void> {
        const post: Promise<IPostDocument> = PostModel.create(createdPost);
        const user: UpdateQuery<IUserDocument> = UserModel.updateOne({_id: userId}, {$inc: {postsCount: 1}});
        await Promise.all([post, user]);
    }

    public async getPosts(query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>): Promise<IPostDocument[]> {
        let postQuery = {};
        if(query?.imgId && query?.gifUrl){
            postQuery = { $or: [{ imgId: { $ne: '' } }, { gifUrl: { $ne: '' } } ]} // give me posts where imgId or gitUrl are not empty strings
        } else {
            postQuery = query;
        }

        const posts: IPostDocument[] = await PostModel.aggregate([
            { $match: postQuery },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit }
        ])
        return posts;
    }

    public async postsCount(): Promise<number> {
        const count: number = await PostModel.find({}).countDocuments();
        return count;
    }
}

export const postService: PostService = new PostService();