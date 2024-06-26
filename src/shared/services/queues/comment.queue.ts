import {BaseQueue} from "@service/queues/base.queue";
import {ICommentJob} from "@comment/interfaces/comment.interface";
import {commentWorker} from "@worker/comment.worker";


class CommentQueue extends BaseQueue{
    constructor() {
        super('comments');
        this.processJob('addComment', 5, commentWorker.addComment);
    }

    public addCommentsJob(name: string, data: ICommentJob) : void {
        this.addJob(name, data);
    }
}

export const commentQueue: CommentQueue = new CommentQueue();