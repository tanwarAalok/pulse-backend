import {DoneCallback, Job} from 'bull'
import Logger from "bunyan";
import {config} from '@root/config'
import {reactionService} from "@service/db/reaction.service";

const log: Logger = config.createLogger('reactionWorker')

class ReactionWorker{
    async addPostReactionToDB(job: Job, done: DoneCallback): Promise<void> {
        try{
            const { data } = job;
            await reactionService.addReactionToDB(data);
            job.progress(100);
            done(null, data);
        }
        catch (error){
            log.error(error)
            done(error as Error)
        }
    }

    async removePostReactionFromDB(job: Job, done: DoneCallback): Promise<void> {
        try{
            const { data } = job;
            await reactionService.deleteReactionFromDB(data);
            job.progress(100);
            done(null, data);
        }
        catch (error){
            log.error(error)
            done(error as Error)
        }
    }
}

export const reactionWorker: ReactionWorker = new ReactionWorker();