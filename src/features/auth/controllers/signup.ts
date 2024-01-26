import {ObjectId} from "mongodb";
import {Request, Response} from "express";
import {joiValidation} from "@global/decorators/joi-validation.decorator";
import {signupSchema} from "@auth/schemes/signup";
import {authService} from "@service/db/auth.service";
import {BadRequestError} from "@global/helpers/error-handler";
import {Helpers} from "@global/helpers/helpers";
import {IAuthDocument, ISignUpData} from "@auth/interfaces/auth.interface";
import {UploadApiResponse} from "cloudinary";
import {uploads} from "@global/helpers/cloudinary-upload";
import HTTP_STATUS from "http-status-codes";

export class Signup{
    @joiValidation(signupSchema)
    public async create(req: Request, res: Response): Promise<void>{
        const {username, email, password, avatarColor, avatarImage} =  req.body;

        const checkIfUserExists = await authService.getUserByUsernameOrEmail(username, email);
        if(checkIfUserExists) throw new BadRequestError('User already exists !');

        const authObjectId: ObjectId = new ObjectId()
        const userObjectId: ObjectId = new ObjectId()
        const uId = `${Helpers.generateRandomIntegers(12)}`;

        const authData: IAuthDocument = Signup.prototype.signupData({
            _id: authObjectId,
            uId,
            username,
            email,
            password,
            avatarColor
        })
        const result: UploadApiResponse = await uploads(avatarImage, `${userObjectId}`, true, true) as UploadApiResponse;
        if(!result?.public_id) throw new BadRequestError('Error occurred while file uploading, Try again!');

        res.status(HTTP_STATUS.CREATED).json({message: 'User created', authData})
    }

    private signupData(data: ISignUpData): IAuthDocument{
        const {_id, username, email, uId, password, avatarColor} = data;
        return {
            _id,
            uId,
            username: Helpers.firstLetterUpperCase(username),
            email: Helpers.lowerCase(email),
            password,
            avatarColor,
            createdAt: new Date()
        } as IAuthDocument
    }
}