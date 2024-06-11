import {PostCache} from "@service/redis/post.cache";
import {Request, Response} from "express";
import HTTP_STATUS from "http-status-codes";
import {socketIOPostObject} from "@socket/post.socket";
import {postQueue} from "@service/queues/post.queue";
import {postSchema, postWithImageSchema} from "@post/schemes/post.schemes";
import {joiValidation} from "@global/decorators/joi-validation.decorator";
import {IPostDocument} from "@post/interfaces/post.interface";
import {UploadApiResponse} from "cloudinary";
import {uploads} from "@global/helpers/cloudinary-upload";
import {BadRequestError} from "@global/helpers/error-handler";


const postCache: PostCache = new PostCache();

export class UpdatePostController {
    @joiValidation(postSchema)
    public async updatePost(req: Request, res: Response) {
        await UpdatePostController.prototype.updateHelper(req);
        res.status(HTTP_STATUS.OK).json({message: 'Post updated successfully'});
    }

    @joiValidation(postWithImageSchema)
    public async updatePostWithImage(req: Request, res: Response) {
        const {imgId, imgVersion} = req.body;

        if(imgId && imgVersion){
            await UpdatePostController.prototype.updateHelper(req);
        }
        else {
            const result: UploadApiResponse = await UpdatePostController.prototype.addImageToExistingPost(req);
            if(!result?.public_id) throw new BadRequestError(result.message);
        }

        res.status(HTTP_STATUS.OK).json({message: 'Post with image updated successfully'});
    }

    private async updateHelper(req: Request) {
        const {
            profilePicture,
            post,
            bgColor,
            feelings,
            privacy,
            gifUrl,
            imgVersion,
            imgId,
        } = req.body;
        const updatedPost: IPostDocument = {
            profilePicture,
            post,
            bgColor,
            feelings,
            privacy,
            gifUrl,
            imgVersion,
            imgId,
        } as IPostDocument;

        const postUpdated = await postCache.updatePostInCache(req.params.postId, updatedPost);
        socketIOPostObject.emit('update post', postUpdated, 'posts');
        postQueue.addPostJob('updatePostInDB', {key: req.params.postId, value: postUpdated});
    }

    private async addImageToExistingPost(req: Request) {
        const {
            profilePicture,
            post,
            bgColor,
            feelings,
            privacy,
            gifUrl,
            image
        } = req.body;

        const result: UploadApiResponse = await uploads(image) as UploadApiResponse;
        if(!result?.public_id) return result;

        const updatedPost: IPostDocument = {
            profilePicture,
            post,
            bgColor,
            feelings,
            privacy,
            gifUrl,
            imgVersion: result.version.toString(),
            imgId: result.public_id,
        } as IPostDocument;

        const postUpdated = await postCache.updatePostInCache(req.params.postId, updatedPost);
        socketIOPostObject.emit('update post', postUpdated, 'posts');
        postQueue.addPostJob('updatePostInDB', {key: req.params.postId, value: postUpdated});
        //TODO: call image queue to add image to mongodb db
        return result;
    }
}