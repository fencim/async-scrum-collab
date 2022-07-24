import { ICeremony } from 'src/entities';
import { firebaseService } from './firebase.service';
import { LocalBaseService } from './localbase.services';
import { Entity, Filters } from './localbase/state-db.controller';

class CeremonyService extends LocalBaseService<ICeremony> {
  constructor() {
    super('ceremony')
  }
  getAllCb?: (filters?: Filters<Entity>) => Promise<ICeremony[]> = async (filter) => {
    return await firebaseService.findAll('ceremonies', filter as { [field: string]: string }) as ICeremony[];
  }
  createCb?: ((data: ICeremony) => Promise<void | ICeremony>) | undefined = async (data) => {
    try {
      return await firebaseService.create('ceremonies', data) as ICeremony;
    } catch (e) {
      console.log(e);
    }
  }
  updateCb?: ((data: ICeremony) => Promise<void | boolean>) | undefined = async (data) => {
    try {
      await firebaseService.update('ceremonies', data.id || data.key, data);
      return true;
    } catch {
      return false;
    }
  }
  deleteCb?: ((data: ICeremony) => Promise<void | boolean>) | undefined = async (data) => {
    try {
      await firebaseService.update('ceremonies', data.id || data.key, data);
      return true;
    } catch {
      return false;
    }
  }
  deleteAllCb?: (() => Promise<void | boolean>) | undefined = async () => {
    try {
      await firebaseService.deleteCollection('ceremonies');
      return true;
    } catch {
      return false;
    }
  }
}
export const ceremonyService = new CeremonyService();
