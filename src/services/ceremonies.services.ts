import { ICeremony } from 'src/entities';
import { LocalBaseService } from './localbase.services';

class CeremonyService extends LocalBaseService<ICeremony> {
    constructor() {
        super('ceremony')
    }
    saveCb?: ((data: ICeremony) => Promise<void>) | undefined = async (data) => {
        console.log('save ceremony', data);
    }
    updateCb?: ((data: ICeremony) => Promise<void>) | undefined = async (data) => {
        console.log('update ceremony', data);
    }
    deleteCb?: ((data: ICeremony) => Promise<void>) | undefined = async (data) => {
        console.log('delete ceremony', data);
    }
    deleteAllCb?: (() => Promise<void>) | undefined = async () => {
        console.log('delete all ceremonys');
    }
}
export const ceremonyService = new CeremonyService();