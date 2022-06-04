import { Convo } from 'src/entities';
import { LocalBaseService } from './localbase.services';

class ConvoService extends LocalBaseService<Convo> {
    constructor() {
        super('convo')
    }
    saveCb?: ((data: Convo) => Promise<void>) | undefined = async () => {
        // console.log('save convo', data);
    }
    updateCb?: ((data: Convo) => Promise<void>) | undefined = async (data) => {
        console.log('update convo', data);
    }
    deleteCb?: ((data: Convo) => Promise<void>) | undefined = async (data) => {
        console.log('delete convo', data);
    }
    deleteAllCb?: (() => Promise<void>) | undefined = async () => {
        console.log('delete all convos');
    }
}
export const convoService = new ConvoService();