import { IProfile } from 'src/entities';
import { firebaseService } from './firebase.service';
import { LocalBaseService } from './localbase.services';

class ProfileService extends LocalBaseService<IProfile> {
  constructor() {
    super('profile')
  }
  createCb?: ((data: IProfile) => Promise<void | boolean | IProfile>) | undefined = async (data) => {
    try {
      return await firebaseService.create('profiles', data) as IProfile;
    } catch {
      return false;
    }
  }
  updateCb?: ((data: IProfile) => Promise<void | boolean>) | undefined = async (data) => {
    try {
      await firebaseService.update('profiles', data.id || data.key, data);
      return true;
    } catch {
      return false;
    }
  }
  deleteCb?: ((data: IProfile) => Promise<void | boolean>) | undefined = async (data) => {
    try {
      await firebaseService.delete('profiles', data.id || data.key);
      return true;
    } catch {
      return false;
    }
  }
  deleteAllCb?: (() => Promise<void | boolean>) | undefined = async () => {
    try {
      await firebaseService.deleteCollection('profiles');
      return true;
    } catch {
      return false;
    }
  }
}
export const profileService = new ProfileService();
