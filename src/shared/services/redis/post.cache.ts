import {BaseCache} from "@service/redis/base.cache";
import Logger from "bunyan";
import {config} from "@root/config";
import {IPostDocument, IReactions, ISavePostToCache} from "@post/interfaces/post.interface";
import {ServerError} from "@global/helpers/error-handler";
import {Helpers} from "@global/helpers/helpers";
import {RedisCommandRawReply} from '@redis/client/dist/lib/commands'

const log: Logger = config.createLogger('postCache');

export type PostCacheMultiType = string | number | Buffer | RedisCommandRawReply[] | IPostDocument | IPostDocument[];

export class PostCache extends BaseCache{
    constructor() {
        super('postCache');
    }

    public async savePostToCache(data: ISavePostToCache): Promise<void> {
        const {key, currentUserId, uId, createdPost} = data;

        const {
            _id,
            userId,
            username,
            email,
            avatarColor,
            profilePicture,
            post,
            bgColor,
            feelings,
            privacy,
            gifUrl,
            commentsCount,
            imgVersion,
            imgId,
            reactions,
            createdAt
        } = createdPost;

        const firstList: string[] = [
            '_id', `${_id}`,
            'userId', `${userId}`,
            'username', `${username}`,
            'email', `${email}`,
            'avatarColor', `${avatarColor}`,
            'profilePicture', `${profilePicture}`,
            'post', `${post}`,
            'bgColor', `${bgColor}`,
            'feelings', `${feelings}`,
            'privacy', `${privacy}`,
            'gifUrl', `${gifUrl}`,

        ];

        const secondList: string[] = [
            'commentsCount', `${commentsCount}`,
            'reactions', `${JSON.stringify(reactions)}`,
            'imgVersion', `${imgVersion}`,
            'imgId', `${imgId}`,
            'createdAt', `${createdAt}`
        ]

        const dataToSave: string[] = [...firstList, ...secondList];

        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }

            const postCount: string[] = await this.client.HMGET(`user:${currentUserId}`, 'postsCount');
            const multi: ReturnType<typeof this.client.multi> = this.client.multi();
            multi.ZADD('post', {score: parseInt(uId, 10), value: `${key}`});
            multi.HSET(`post:${key}`, dataToSave);
            const count: number = parseInt(postCount[0], 10) + 1;
            multi.HSET(`user:${currentUserId}`, ['postsCount', count]);
            await multi.exec();

        } catch(error){
            log.error(error);
            throw new ServerError('Server error, try again !')
        }
    }

    public async getPostsFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }

            const reply: string[] = await this.client.ZRANGE(key, start, end, {REV: true});
            const multi: ReturnType<typeof this.client.multi> = this.client.multi();
            for(const value of reply){
                multi.HGETALL(`post:${value}`);
            }
            const replies: PostCacheMultiType = await multi.exec() as PostCacheMultiType;
            const postReplies: IPostDocument[] = [];
            for(const post of replies as IPostDocument[]){
                post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
                post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
                post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`));
                postReplies.push(post);
            }

            return postReplies;
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again');
        }
    }

    public async getTotalPostsInCache(): Promise<number> {
        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }
            return await this.client.ZCARD('post');
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again');
        }
    }

    public async getPostsWithImagesFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }

            const reply: string[] = await this.client.ZRANGE(key, start, end, {REV: true});
            const multi: ReturnType<typeof this.client.multi> = this.client.multi();
            for(const value of reply){
                multi.HGETALL(`post:${value}`);
            }
            const replies: PostCacheMultiType = await multi.exec() as PostCacheMultiType;
            const postWithImages: IPostDocument[] = [];
            for(const post of replies as IPostDocument[]){
                if((post.imgId && post.imgVersion) || post.gifUrl){
                    post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
                    post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
                    post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`));
                    postWithImages.push(post);
                }

            }

            return postWithImages;
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again');
        }
    }

    public async getUserPostsFromCache(key: string, uId: number): Promise<IPostDocument[]> {
        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }

            const reply: string[] = await this.client.ZRANGE(key, uId, uId, {REV: true, BY: 'SCORE'});
            const multi: ReturnType<typeof this.client.multi> = this.client.multi();
            for(const value of reply){
                multi.HGETALL(`post:${value}`);
            }
            const replies: PostCacheMultiType = await multi.exec() as PostCacheMultiType;
            const postReplies: IPostDocument[] = [];
            for(const post of replies as IPostDocument[]){
                if((post.imgId && post.imgVersion) || post.gifUrl){
                    post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
                    post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
                    post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`));
                    postReplies.push(post);
                }
            }

            return postReplies;
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again');
        }
    }

    public async getTotalUserPostsInCache(uId: number): Promise<number> {
        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }
            return await this.client.ZCOUNT('post', uId, uId);
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again');
        }
    }

    public async deletePostFromCache(key: string, currentUserId: string): Promise<void> {
        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }
            const postCount: string[] = await this.client.HMGET(`user:${currentUserId}`, 'postsCount');
            const multi: ReturnType<typeof this.client.multi> = this.client.multi();
            multi.ZREM('post', `${key}`);
            multi.DEL(`post:${key}`);
            // TODO: Uncomment when comment and reaction are created
            // multi.DEL(`comment:${key}`);
            // multi.DEL(`reaction:${key}`);
            const count: number = parseInt(postCount[0], 10) - 1;
            multi.HSET(`user:${currentUserId}`, ['postsCount', count]);
            await multi.exec();
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again');
        }
    }

    public async updatePostInCache(key: string, updatedPost: IPostDocument): Promise<IPostDocument>{
        const {
            profilePicture,
            post,
            bgColor,
            feelings,
            privacy,
            gifUrl,
            imgVersion,
            imgId,
        } = updatedPost;

        const dataToSave: string[] = [
            'profilePicture', `${profilePicture}`,
            'post', `${post}`,
            'bgColor', `${bgColor}`,
            'feelings', `${feelings}`,
            'privacy', `${privacy}`,
            'gifUrl', `${gifUrl}`,
            'imgVersion', `${imgVersion}`,
            'imgId', `${imgId}`,

        ];

        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }
            await this.client.HSET(`post:${key}`, dataToSave);

            const multi: ReturnType<typeof this.client.multi> = this.client.multi();
            multi.HGETALL(`post:${key}`);

            const reply: PostCacheMultiType = await multi.exec() as PostCacheMultiType;
            const postReplies: IPostDocument[] = reply as IPostDocument[];

            postReplies[0].commentsCount = Helpers.parseJson(`${postReplies[0].commentsCount}`);
            postReplies[0].createdAt = new Date(Helpers.parseJson(`${postReplies[0].createdAt}`));
            postReplies[0].reactions = Helpers.parseJson(`${postReplies[0].reactions}`);
            return postReplies[0];
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again');
        }
    }
}