import {Request, Response} from 'express';
import {config} from "@root/config";
import JWT from "jsonwebtoken";
import HTTP_STATUS from "http-status-codes";
import {joiValidation} from "@global/decorators/joi-validation.decorator";
import {authService} from "@service/db/auth.service";
import {BadRequestError} from "@global/helpers/error-handler";
import {loginSchema} from "@auth/schemes/signin";
import { IUserDocument} from "@user/interfaces/user.interface";
import {userService} from "@service/db/user.service";

export class SignIn {
    @joiValidation(loginSchema)
    public async read(req: Request, res: Response) : Promise<void> {
        const {username, password} = req.body;

        const existingUser = await authService.getAuthUserByUsername(username);
        if(!existingUser) throw new BadRequestError('Invalid credentials');

        const passwordMatch: boolean = await existingUser.comparePassword(password);
        if(!passwordMatch) throw new BadRequestError('Invalid credentials');

        const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);
        if(!user) throw new BadRequestError('Invalid credentials, user not found !');


        const userJWT: string = JWT.sign(
            {
                userId: user._id,
                uId: existingUser.uId,
                email: existingUser.email,
                username: existingUser.username,
                avatarColor: existingUser.avatarColor
            },
            config.JWT_TOKEN!
        );

        const userDocument: IUserDocument = {
            ...user,
            authId: existingUser!._id,
            username: existingUser!.username,
            email: existingUser!.email,
            avatarColor: existingUser!.avatarColor,
            uId: existingUser!.uId,
            createdAt: existingUser!.createdAt,
        } as IUserDocument;


        req.session = {jwt: userJWT};
        res.status(HTTP_STATUS.OK).json({message: 'User login successfully', user: userDocument, token: userJWT})
    }
}