import {Request, Response} from 'express';
import {config} from "@root/config";
import JWT from "jsonwebtoken";
import HTTP_STATUS from "http-status-codes";
import {emailSchema, passwordSchema} from "@auth/schemes/password";
import {joiValidation} from "@global/decorators/joi-validation.decorator";
import {IAuthDocument} from "@auth/interfaces/auth.interface";
import {authService} from "@service/db/auth.service";
import {BadRequestError} from "@global/helpers/error-handler";
import crypto from "crypto";
import {forgotPasswordTemplate} from "@service/emails/templates/forgot-password/forgot-password-template";
import {emailQueue} from "@service/queues/email.queue";
import {IResetPasswordParams} from "@user/interfaces/user.interface";
import publicIP from "ip";
import moment from "moment/moment";
import {resetPasswordTemplate} from "@service/emails/templates/reset-password/reset-password-template";


export class Password {
    @joiValidation(emailSchema)
    public async create(req: Request, res: Response): Promise<void> {
        const {email} = req.body;

        const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email);
        if(!existingUser) throw new BadRequestError('Invalid Credentials!');

        const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
        const randomCharacter: string = randomBytes.toString('hex');

        await authService.updatePasswordToken(`${existingUser._id!}`, randomCharacter, Date.now() * 60 * 60 * 1000);
        const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacter}`;
        const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username!, resetLink);
        emailQueue.addEmailJob('forgotPasswordEmail', {template, receiverEmail: email, subject: 'Reset your password'});

        res.status(HTTP_STATUS.OK).json({message: "Password reset email sent."});
    }

    @joiValidation(passwordSchema)
    public async update(req: Request, res: Response): Promise<void> {
        const {password, confirmPassword} = req.body;
        const {token} = req.params;

        if(!token) throw new BadRequestError('Token not found!');

        const existingUser: IAuthDocument = await authService.getAuthUserByPasswordToken(token);
        if(!existingUser) throw new BadRequestError('Reset token has expired.!');

        existingUser.password = password;
        existingUser.passwordResetExpires = undefined;
        existingUser.passwordResetToken = undefined;
        await existingUser.save();

        const templateParams: IResetPasswordParams = {
            username: existingUser.username!,
            email: existingUser.email!,
            ipaddress: publicIP.address(),
            date: moment().format('DD/MM/YYYY HH:MM')
        }

        const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
        emailQueue.addEmailJob('forgotPasswordEmail', {template, receiverEmail: existingUser.email!, subject: 'Password reset successfully'});

        res.status(HTTP_STATUS.OK).json({message: "Password successfully updated"});
    }
}