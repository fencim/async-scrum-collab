import { Convo } from 'src/entities';
import { firebaseService } from './firebase.service';
import { LocalBaseService } from './localbase.services';
import { Entity, Filters } from './localbase/state-db.controller';

class ConvoService extends LocalBaseService<Convo> {
  constructor() {
    super('convo')
  }
  getAllCb?: (filters?: Filters<Entity>) => Promise<Convo[]> = async (filter) => {
    return await firebaseService.findAll('convos', filter as { [field: string]: string }) as Convo[];
  }
  createCb?: ((data: Convo) => Promise<void | Convo>) | undefined = async (data) => {
    try {
      return await firebaseService.create('convos', data) as Convo;
    } catch (e) {
      console.log(e);
    }
  }
  updateCb?: ((data: Convo) => Promise<void | boolean>) | undefined = async (data) => {
    try {
      await firebaseService.update('convos', data.id || data.key, data);
      return true;
    } catch {
      return false;
    }
  }
  deleteCb?: ((data: Convo) => Promise<void | boolean>) | undefined = async (data) => {
    try {
      await firebaseService.update('convos', data.id || data.key, data);
      return true;
    } catch {
      return false;
    }
  }
  deleteAllCb?: (() => Promise<void | boolean>) | undefined = async () => {
    try {
      await firebaseService.deleteCollection('convos');
      return true;
    } catch {
      return false;
    }
  }
}
export const convoService = new ConvoService();
