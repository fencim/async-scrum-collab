import { LocalBaseService } from './localbase.services';
export interface IIteration {
    key: string;
    projectKey: string;
    name: string;
    start: string;
    end: string;
}
class ProfileService extends LocalBaseService<IIteration> {
    constructor() {
        super('iteration')
    }
    saveCb?: ((data: IIteration) => Promise<void>) | undefined = async (data) => {
        console.log('save iteration', data);
    }
    updateCb?: ((data: IIteration) => Promise<void>) | undefined = async (data) => {
        console.log('update iteration', data);
    }
    deleteCb?: ((data: IIteration) => Promise<void>) | undefined = async (data) => {
        console.log('delete iteration', data);
    }
    deleteAllCb?: (() => Promise<void>) | undefined = async () => {
        console.log('delete all iterations');
    }
}
export const iterationService = new ProfileService();