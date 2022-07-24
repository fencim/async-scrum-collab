import { IIteration } from 'src/entities';
import { firebaseService } from './firebase.service';
import { LocalBaseService } from './localbase.services';
import { Entity, Filters } from './localbase/state-db.controller';

class ProfileService extends LocalBaseService<IIteration> {
  constructor() {
    super('iteration')
  }
  getAllCb?: (filters?: Filters<Entity>) => Promise<IIteration[]> = async (filter) => {
    return await firebaseService.findAll('iterations', filter as { [field: string]: string }) as IIteration[];
  }
  createCb?: ((data: IIteration) => Promise<void | boolean | IIteration>) | undefined = async (data) => {
    try {
      return await firebaseService.create('iterations', data) as IIteration;
    } catch (e) {
      console.log(e);
    }
  }
  updateCb?: ((data: IIteration) => Promise<void | boolean>) | undefined = async (data) => {
    try {
      await firebaseService.update('iterations', data.id || data.key, data);
      return true;
    } catch {
      return false;
    }
  }
  deleteCb?: ((data: IIteration) => Promise<void | boolean>) | undefined = async (data) => {
    try {
      await firebaseService.update('iterations', data.id || data.key, data);
      return true;
    } catch {
      return false;
    }
  }
  deleteAllCb?: (() => Promise<void | boolean>) | undefined = async () => {
    try {
      await firebaseService.deleteCollection('iterations');
      return true;
    } catch {
      return false;
    }
  }
}
export const iterationService = new ProfileService();
