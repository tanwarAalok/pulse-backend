import Logger from "bunyan";
import {config} from "@root/config";
import {BaseCache} from "@service/redis/base.cache";
import {ServerError} from "@global/helpers/error-handler";
import {IFollowerData} from "@follower/interfaces/follower.interface";
import {UserCache} from "@service/redis/user.cache";
import {IUserDocument} from "@user/interfaces/user.interface";
import mongoose from "mongoose";
import {Helpers} from "@global/helpers/helpers";
import {remove} from "lodash";

const log: Logger = config.createLogger('followerCache');
const userCache: UserCache = new UserCache();

export class FollowerCache extends BaseCache {
    constructor() {
        super('followerCache');
    }

    public async saveFollowerToCache(key: string, value: string): Promise<void> {
        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }

            await this.client.LPUSH(key, value);

        } catch (error){
            log.error(error);
            throw new ServerError('Server error. Try again')
        }
    }

    public async removeFollowerFromCache(key: string, value: string): Promise<void> {
        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }

            await this.client.LREM(key, 1, value);

        } catch (error){
            log.error(error);
            throw new ServerError('Server error. Try again')
        }
    }

    public async updateFollowerCountInCache(userId: string, prop: string, value: number): Promise<void> {
        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }

            await this.client.HINCRBY(`user:${userId}`, prop, value);

        } catch (error){
            log.error(error);
            throw new ServerError('Server error. Try again')
        }
    }

    public async getFollowersFromCache(key: string): Promise<IFollowerData[]> {
        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }

            const response: string[] = await this.client.LRANGE(key, 0, -1);
            const list: IFollowerData[] = [];
            for(const item of response){
                const user: IUserDocument = await userCache.getUserFromCache(item) as IUserDocument;
                const data: IFollowerData =  {
                    _id: new mongoose.Types.ObjectId(user._id),
                    username: user.username!,
                    avatarColor: user.avatarColor!,
                    postCount: user.postsCount,
                    followersCount: user.followersCount,
                    followingCount: user.followingCount,
                    profilePicture: user.profilePicture,
                    uId: user.uId!,
                    userProfile: user
                }
                list.push(data);
            }
            return list;

        } catch (error){
            log.error(error);
            throw new ServerError('Server error. Try again')
        }
    }

    public async updateBlockedUserPropInCache(key: string, prop: string, value: string, type: 'block' | 'unblock'): Promise<void> {
        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }

            const response: string = (await this.client.HGET(`user:${key}`, prop)) as string;
            const multi: ReturnType<typeof this.client.multi> = this.client.multi();
            let blocked: string[] = Helpers.parseJson(response) as string[];
            if (type === 'block') {
                blocked = [...blocked, value];
            } else {
                remove(blocked, (id: string) => id === value);
                blocked = [...blocked];
            }
            multi.HSET(`user:${key}`, `${prop}`, JSON.stringify(blocked));
            await multi.exec();

        } catch (error){
            log.error(error);
            throw new ServerError('Server error. Try again')
        }
    }

}