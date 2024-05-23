import {Request, Response} from 'express';
import * as cloudinaryUploads from "@global/helpers/cloudinary-upload";
import {authMock, authMockRequest, authMockResponse} from "@root/mocks/auth.mock";
import {Signup} from "@auth/controllers/signup";
import {CustomError} from "@global/helpers/error-handler";
import {authService} from "@service/db/auth.service";
import {UserCache} from "@service/redis/user.cache";

jest.mock('@service/queues/base.queue');
jest.mock('@service/queues/user.queue');
jest.mock('@service/queues/auth.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@global/helpers/cloudinary-upload');

describe('Signup', () => {
    it('should throw error if username is not available', () => {
        const req: Request = authMockRequest({}, {
            username: '',
            email: 'test@test.com',
            password: 'password',
            avatarColor: 'red',
            avatarImage: 'data:image/jpeg;base64,/9j/4',
        }) as Request;

        const res: Response = authMockResponse();

        Signup.prototype.create(req, res).catch((err: CustomError) => {
            expect(err.statusCode).toBe(400);
            expect(err.serializeErrors().message).toEqual('Username is a required field')
        })
    })

    it('should throw error if username length is less than minimum length', () => {
        const req: Request = authMockRequest({}, {
            username: 'ma',
            email: 'test@test.com',
            password: 'password',
            avatarColor: 'red',
            avatarImage: 'data:image/jpeg;base64,/9j/4',
        }) as Request;

        const res: Response = authMockResponse();

        Signup.prototype.create(req, res).catch((err: CustomError) => {
            expect(err.statusCode).toBe(400);
            expect(err.serializeErrors().message).toEqual('Invalid username, Cannot be less than 4 characters')
        })
    })

    it('should throw error if username length is more than maximum length', () => {
        const req: Request = authMockRequest({}, {
            username: 'mamamamamamama',
            email: 'test@test.com',
            password: 'password',
            avatarColor: 'red',
            avatarImage: 'data:image/jpeg;base64,/9j/4',
        }) as Request;

        const res: Response = authMockResponse();

        Signup.prototype.create(req, res).catch((err: CustomError) => {
            expect(err.statusCode).toBe(400);
            expect(err.serializeErrors().message).toEqual('Invalid username, Cannot be more than 8 characters')
        })
    })

    it('should throw an error if email is not valid', () => {
        const req: Request = authMockRequest({}, {
            username: 'Manny',
            email: 'not valid',
            password: 'password',
            avatarColor: 'red',
            avatarImage: 'data:image/jpeg;base64,/9j/4',
        }) as Request;

        const res: Response = authMockResponse();

        Signup.prototype.create(req, res).catch((err: CustomError) => {
            expect(err.statusCode).toBe(400);
            expect(err.serializeErrors().message).toEqual('Email must be valid')
        })
    })

    it('should throw unauthorized if user already exists', () => {
        const req: Request = authMockRequest({}, {
            username: 'Manny',
            email: 'test@gmail.com',
            password: 'password',
            avatarColor: 'red',
            avatarImage: 'data:image/jpeg;base64,/9j/4',
        }) as Request;

        const res: Response = authMockResponse();

        jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock);
        Signup.prototype.create(req, res).catch((err: CustomError) => {
            expect(err.statusCode).toBe(400);
            expect(err.serializeErrors().message).toEqual('User already exists !')
        })
    })

    it('should set session data for valid credentials and send correct json response', async () => {
        const req: Request = authMockRequest({}, {
            username: 'Manny',
            email: 'test@gmail.com',
            password: 'password',
            avatarColor: 'red',
            avatarImage: 'data:image/jpeg;base64,/9j/4',
        }) as Request;

        const res: Response = authMockResponse();

        jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock);
        const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
        jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation(() : any => Promise.resolve({version: '121412', public_id: '21343'}))

        await Signup.prototype.create(req, res)
        expect(req.session?.jwt).toBeDefined();
        expect(res.json).toHaveBeenCalledWith({
            message: 'User created',
            user: userSpy.mock.calls[0][2],
            token: req.session?.jwt
        })
    })
})