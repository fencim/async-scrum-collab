import { IMedia } from 'src/entities';
import { firebaseService } from './firebase.service';
import { LocalBaseService } from './localbase.services';
import { Entity, Filters } from './localbase/state-db.controller';

class AttachmentService extends LocalBaseService<IMedia> {
  constructor() {
    super('media')
  }
  getAllCb?: (filters?: Filters<Entity>) => Promise<IMedia[]> = async (filter) => {
    return await firebaseService.findAll('medias', filter as { [field: string]: string }) as IMedia[];
  }
  createCb?: ((data: IMedia) => Promise<void | IMedia>) | undefined = async (data) => {
    try {
      return await firebaseService.create('medias', data) as IMedia;
    } catch (e) {
      console.log(e);
    }
  }
  updateCb?: ((data: IMedia) => Promise<void | boolean>) | undefined = async (data) => {
    try {
      await firebaseService.update('medias', data.id || data.key, data);
      return true;
    } catch {
      return false;
    }
  }
  deleteCb?: ((data: IMedia) => Promise<void | boolean>) | undefined = async (data) => {
    try {
      await firebaseService.update('medias', data.id || data.key, data);
      return true;
    } catch {
      return false;
    }
  }
  deleteAllCb?: (() => Promise<void | boolean>) | undefined = async () => {
    try {
      await firebaseService.deleteCollection('projects');
      return true;
    } catch {
      return false;
    }
  }
}
export const mediaService = new AttachmentService();
