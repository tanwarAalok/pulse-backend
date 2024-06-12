import Logger from "bunyan";
import {config} from "@root/config";
import {BaseCache} from "@service/redis/base.cache";
import {ServerError} from "@global/helpers/error-handler";
import {IReactionDocument, IReactions} from "@reaction/interfaces/reaction.interface";
import {Helpers} from "@global/helpers/helpers";
import {find} from "lodash";


const log: Logger = config.createLogger('reactionCache');

export class ReactionCache extends BaseCache{
    constructor() {
        super('reactionCache');
    }

    public async savePostReactionToCache(
        key: string,
        reaction: IReactionDocument,
        postReactions: IReactions,
        type: string,
        previousReaction: string
    ): Promise<void>{
        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }

            if(previousReaction){
                await this.removePostReactionFromCache(key, reaction.username, postReactions);
            }

            if(type){
                await this.client.LPUSH(`reaction:${key}`, JSON.stringify(reaction));
                const dataToSave: string[] = ['reactions', JSON.stringify(postReactions)];
                await this.client.HSET(`post:${key}`, dataToSave);
            }

        } catch (error){
            log.error(error);
            throw new ServerError('Server error. Try again');
        }
    }

    public async removePostReactionFromCache(
        key: string,
        username: string,
        postReactions: IReactions,
    ): Promise<void>{
        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }

            const reactions: string[] = await this.client.LRANGE(`reaction:${key}`, 0, -1);
            const multi: ReturnType<typeof this.client.multi> = this.client.multi();
            const userPreviousReaction: IReactionDocument = this.getPreviousReaction(reactions, username) as IReactionDocument;
            multi.LREM(`reaction:${key}`, 1, JSON.stringify(userPreviousReaction));
            await multi.exec();

            const dataToSave: string[] = ['reactions', JSON.stringify(postReactions)];
            await this.client.HSET(`post:${key}`, dataToSave);

        } catch (error){
            log.error(error);
            throw new ServerError('Server error. Try again');
        }
    }

    private getPreviousReaction(reactions: string[], username: string): IReactionDocument | undefined {
        const list: IReactionDocument[] = [];
        for(const item of reactions){
            list.push(Helpers.parseJson(item) as IReactionDocument);
        }
        return find(list, (listItem: IReactionDocument) => {
            return listItem.username === username;
        })
    }
}