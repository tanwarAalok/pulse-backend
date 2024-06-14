import Logger from "bunyan";
import {config} from "@root/config";
import {BaseCache} from "@service/redis/base.cache";
import {ServerError} from "@global/helpers/error-handler";
import {Helpers} from "@global/helpers/helpers";
import {ICommentDocument, ICommentNameList} from "@comment/interfaces/comment.interface";
import {find} from "lodash";


const log: Logger = config.createLogger('commentCache');

export class CommentCache extends BaseCache{
    constructor() {
        super('commentCache');
    }

    public async savePostCommentToCache(postId: string, value: string): Promise<void> {
        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }

            await this.client.LPUSH(`comments:${postId}`, value);
            const commentsCount: string[] = await this.client.HMGET(`post:${postId}`, 'commentsCount');
            let count: number = Helpers.parseJson(commentsCount[0]) as number;
            count += 1;

            const dataToSave: string[] = ['commentsCount', `${count}`];
            await this.client.HSET(`post:${postId}`, dataToSave);

        } catch(error){
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getCommentsFromCache(postId: string): Promise<ICommentDocument[]> {
        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }

            const reply: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
            const list: ICommentDocument[] = [];
            for(const value of reply){
                list.push(Helpers.parseJson(value));
            }
            return list;

        } catch(error){
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getCommentsNamesFromCache(postId: string): Promise<ICommentNameList[]> {
        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }

            const commentsCount: number = await this.client.LLEN(`comments:${postId}`);
            const comments: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
            const list: string[] = [];
            for(const item of comments){
                const comment: ICommentDocument = Helpers.parseJson(item) as ICommentDocument;
                list.push(comment.username);
            }
            const response: ICommentNameList = {
                count: commentsCount,
                names: list
            }

            return [response];

        } catch(error){
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getSingleCommentFromCache(postId: string, commentId: string): Promise<ICommentDocument[]> {
        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }

            const comments: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
            const list: ICommentDocument[] = [];
            for(const item of comments){
                list.push(Helpers.parseJson(item));
            }
            const result: ICommentDocument = find(list, (listItem: ICommentDocument) => {
                return listItem._id === commentId;
            }) as ICommentDocument;

            return [result];

        } catch(error){
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }
}