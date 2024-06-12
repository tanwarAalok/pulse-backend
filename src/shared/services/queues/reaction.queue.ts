import {BaseQueue} from "@service/queues/base.queue";
import {IReactionJob} from "@reaction/interfaces/reaction.interface";
import {reactionWorker} from "@worker/reaction.worker";

class ReactionQueue extends BaseQueue{
    constructor() {
        super('reaction');
        this.processJob('addPostReactionToDB', 5, reactionWorker.addPostReactionToDB)
        this.processJob('removePostReactionFromDB', 5, reactionWorker.removePostReactionFromDB)
    }

    public addReactionJob(name: string, data: IReactionJob) : void {
        this.addJob(name, data)
    }
}

export const reactionQueue: ReactionQueue = new ReactionQueue()