import { IMedia } from 'src/entities';
import { LocalBaseService } from './localbase.services';

class AttachmentService extends LocalBaseService<IMedia> {
    constructor() {
        super('media')
    }
    saveCb?: ((data: IMedia) => Promise<void>) | undefined = async (data) => {
        console.log('save media', data);
    }
    updateCb?: ((data: IMedia) => Promise<void>) | undefined = async (data) => {
        console.log('update media', data);
    }
    deleteCb?: ((data: IMedia) => Promise<void>) | undefined = async (data) => {
        console.log('delete media', data);
    }
    deleteAllCb?: (() => Promise<void>) | undefined = async () => {
        console.log('delete all medias');
    }
}
export const mediaService = new AttachmentService();