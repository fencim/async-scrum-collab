import { DiscussionItem } from 'src/entities';
import { LocalBaseService } from './localbase.services';


class DiscussionService extends LocalBaseService<DiscussionItem> {
    constructor() {
        super('discussion')
    }
    saveCb?: ((data: DiscussionItem) => Promise<void>) | undefined = async (data) => {
        console.log('save discussion', data);
    }
    updateCb?: ((data: DiscussionItem) => Promise<void>) | undefined = async (data) => {
        console.log('update discussion', data);
    }
    deleteCb?: ((data: DiscussionItem) => Promise<void>) | undefined = async (data) => {
        console.log('delete discussion', data);
    }
    deleteAllCb?: (() => Promise<void>) | undefined = async () => {
        console.log('delete all discussions');
    }
}
export const discussionService = new DiscussionService();