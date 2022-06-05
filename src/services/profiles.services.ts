import { IProfile } from 'src/entities';
import { LocalBaseService } from './localbase.services';

class ProfileService extends LocalBaseService<IProfile> {
    constructor() {
        super('profile')
    }
    saveCb?: ((data: IProfile) => Promise<void>) | undefined = async (data) => {
        console.log('save profile', data);

    }
    updateCb?: ((data: IProfile) => Promise<void>) | undefined = async (data) => {
        console.log('update profile', data);
    }
    deleteCb?: ((data: IProfile) => Promise<void>) | undefined = async (data) => {
        console.log('delete profile', data);
    }
    deleteAllCb?: (() => Promise<void>) | undefined = async () => {
        console.log('delete all profiles');
    }

}
export const profileService = new ProfileService();