import {IAuthDocument} from "@auth/interfaces/auth.interface";
import {Helpers} from "@global/helpers/helpers";
import {AuthModel} from "@auth/models/auth.schema";

class AuthService{

    public async createAuthUser(data: IAuthDocument) : Promise<void> {
        await AuthModel.create(data);
    }

    public async updatePasswordToken(authId: string, token: string, tokenExpiration: number) : Promise<void> {
        await AuthModel.updateOne({_id: authId}, {
            passwordResetToken: token,
            passwordResetExpires: tokenExpiration
        })
    }

    public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument>{
        const query = {
            $or: [{username: Helpers.firstLetterUpperCase(username)}, {email: Helpers.lowerCase(email)}]
        }

        return await AuthModel.findOne(query).exec() as IAuthDocument;
    }

    public async getAuthUserByUsername(username: string): Promise<IAuthDocument>{
        return await AuthModel.findOne({username: Helpers.firstLetterUpperCase(username)}).exec() as IAuthDocument;
    }

    public async getAuthUserByEmail(email: string): Promise<IAuthDocument>{
        return await AuthModel.findOne({email: Helpers.lowerCase(email)}).exec() as IAuthDocument;
    }

    public async getAuthUserByPasswordToken(token: string): Promise<IAuthDocument>{
        return await AuthModel.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        }).exec() as IAuthDocument;
    }
}

export const authService: AuthService = new AuthService();