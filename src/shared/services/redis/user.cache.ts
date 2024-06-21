import {BaseCache} from "@service/redis/base.cache";
import {INotificationSettings, ISocialLinks, IUserDocument} from "@user/interfaces/user.interface";
import Logger from "bunyan";
import {config} from "@root/config";
import {ServerError} from "@global/helpers/error-handler";
import {Helpers} from "@global/helpers/helpers";

const log: Logger = config.createLogger('userCache')
type UserItem = string | ISocialLinks | INotificationSettings;

export class UserCache extends BaseCache{
    constructor() {
        super('userCache');
    }

    public async saveUserToCache(key: string, userId: string, createdUser: IUserDocument): Promise<void> {
        const createdAt = new Date()
        const {
            _id, uId,
            username, email,
            avatarColor,
            blocked, blockedBy,
            postsCount, profilePicture,
            followersCount, followingCount,
            notifications,
            work,location,school,
            quote,bgImageVersion, bgImageId, social
        } = createdUser;

        const firstList: string[] = [
            '_id', `${_id}`,
            'uId', `${uId}`,
            'username', `${username}`,
            'email', `${email}`,
            'avatarColor', `${avatarColor}`,
            'createdAt', `${createdAt}`,
            'postsCount', `${postsCount}`
        ];

        const secondList: string[] = [
            'blocked', `${JSON.stringify(blocked)}`,
            'blockedBy', `${JSON.stringify(blockedBy)}`,
            'profilePicture', `${profilePicture}`,
            'followersCount', `${followersCount}`,
            'followingCount', `${followingCount}`,
            'notifications', JSON.stringify(notifications),
            'social', JSON.stringify(social)
        ];

        const thirdList: string[] = [
            'work', `${work}`,
            'location', `${location}`,
            'school', `${school}`,
            'quote', `${quote}`,
            'bgImageVersion', `${bgImageVersion}`,
            'bgImageId', `${bgImageId}`
        ];

        const dataToSave = [...firstList, ...secondList, ...thirdList]

        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }
            await this.client.ZADD('user', {score: parseInt(userId, 10), value: `${key}`});
            await this.client.HSET(`user:${key}`, dataToSave);
        } catch (error){
            log.error(error)
            throw new ServerError('Server error, try again !')
        }
    }

    public async getUserFromCache(key: string): Promise<IUserDocument | null> {
        try{
            if(!this.client.isOpen){
                await this.client.connect();
            }
            const response: IUserDocument = await this.client.HGETALL(`user:${key}`) as unknown as IUserDocument;
            response.createdAt = new Date(Helpers.parseJson(`${response.createdAt}`));
            response.postsCount = Helpers.parseJson(`${response.postsCount}`);
            response.blocked = Helpers.parseJson(`${response.blocked}`);
            response.blockedBy = Helpers.parseJson(`${response.blockedBy}`);
            response.notifications = Helpers.parseJson(`${response.notifications}`);
            response.social = Helpers.parseJson(`${response.social}`);
            response.followersCount = Helpers.parseJson(`${response.followersCount}`);
            response.followingCount = Helpers.parseJson(`${response.followingCount}`);
            response.bgImageId = Helpers.parseJson(`${response.bgImageId}`);
            response.bgImageVersion = Helpers.parseJson(`${response.bgImageVersion}`);
            response.profilePicture = Helpers.parseJson(`${response.profilePicture}`);
            response.work = Helpers.parseJson(`${response.work}`);
            response.school = Helpers.parseJson(`${response.school}`);
            response.location = Helpers.parseJson(`${response.location}`);
            response.quote = Helpers.parseJson(`${response.quote}`);

            return response;
        }
        catch(error){
            log.error(error)
            throw new ServerError('Server error, try again !')
        }
    }

    public async updateSingleUserItemInCache(userId: string, prop: string, value: UserItem): Promise<IUserDocument | null>{
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
            await this.client.HSET(`user:${userId}`, `${prop}`, JSON.stringify(value));
            const response: IUserDocument = (await this.getUserFromCache(userId)) as IUserDocument;
            return response;
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getTotalUsersInCache(): Promise<number> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
            const count: number = await this.client.ZCARD('user');
            return count;
        } catch (error) {
            log.error(error);
            throw new ServerError('Server error. Try again.');
        }
    }
}