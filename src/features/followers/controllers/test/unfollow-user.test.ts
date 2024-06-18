import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { followersMockRequest, followersMockResponse } from '@root/mocks/followers.mock';
import { existingUser } from '@root/mocks/user.mock';
import { followerQueue } from '@service/queues/follower.queue';
import { FollowerCache } from '@service/redis/follower.cache';
import {UnfollowUserController} from "@follower/controllers/unfollow-user";

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/follower.cache');

describe('Remove', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should send correct json response', async () => {
    const req: Request = followersMockRequest({}, authUserPayload, {
      followerId: `${existingUser._id}`,
      followeeId: '6064861bc25eaa5a5d2f9bf4'
    }) as Request;
    const res: Response = followersMockResponse();
    jest.spyOn(FollowerCache.prototype, 'removeFollowerFromCache');
    jest.spyOn(FollowerCache.prototype, 'updateFollowerCountInCache');
    jest.spyOn(followerQueue, 'addFollowerJob');

    await UnfollowUserController.prototype.unfollow(req, res);
    expect(FollowerCache.prototype.removeFollowerFromCache).toHaveBeenCalledTimes(2);
    expect(FollowerCache.prototype.removeFollowerFromCache).toHaveBeenCalledWith(
      `followings:${req.currentUser!.userId}`,
      req.params.followeeId
    );
    expect(FollowerCache.prototype.removeFollowerFromCache).toHaveBeenCalledWith(
      `followers:${req.params.followeeId}`,
      req.params.followerId
    );
    expect(FollowerCache.prototype.updateFollowerCountInCache).toHaveBeenCalledTimes(2);
    expect(FollowerCache.prototype.updateFollowerCountInCache).toHaveBeenCalledWith(`${req.params.followeeId}`, 'followersCount', -1);
    expect(FollowerCache.prototype.updateFollowerCountInCache).toHaveBeenCalledWith(`${req.params.followerId}`, 'followingCount', -1);
    expect(followerQueue.addFollowerJob).toHaveBeenCalledWith('removeFollowerFromDb', {
      keyOne: `${req.params.followerId}`,
      keyTwo: `${req.params.followeeId}`
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unfollowed user now'
    });
  });
});
