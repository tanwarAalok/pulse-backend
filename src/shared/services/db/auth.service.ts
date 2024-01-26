import {IAuthDocument} from "@auth/interfaces/auth.interface";
import {Helpers} from "@global/helpers/helpers";
import {AuthModel} from "@auth/models/auth.schema";

class AuthService{
    public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument>{
        const query = {
            $or: [{username: Helpers.firstLetterUpperCase(username)}, {email: Helpers.lowerCase(email)}]
        }

        return await AuthModel.findOne(query).exec() as IAuthDocument;
    }
}

export const authService: AuthService = new AuthService();