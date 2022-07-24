import { DiscussionItem } from 'src/entities';
import { firebaseService } from './firebase.service';
import { LocalBaseService } from './localbase.services';
import { Entity, Filters } from './localbase/state-db.controller';


class DiscussionService extends LocalBaseService<DiscussionItem> {
  constructor() {
    super('discussion')
  }
  getAllCb?: (filters?: Filters<Entity>) => Promise<DiscussionItem[]> = async (filter) => {
    return await firebaseService.findAll('discussions', filter as { [field: string]: string }) as DiscussionItem[];
  }
  createCb?: ((data: DiscussionItem) => Promise<void | DiscussionItem>) | undefined = async (data) => {
    try {
      return await firebaseService.create('discussions', data) as DiscussionItem;
    } catch (e) {
      console.log(e);
    }
  }
  updateCb?: ((data: DiscussionItem) => Promise<void | boolean>) | undefined = async (data) => {
    try {
      await firebaseService.update('discussions', data.id || data.key, data);
      return true;
    } catch {
      return false;
    }
  }
  deleteCb?: ((data: DiscussionItem) => Promise<void | boolean>) | undefined = async (data) => {
    try {
      await firebaseService.update('discussions', data.id || data.key, data);
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
export const discussionService = new DiscussionService();
