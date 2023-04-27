import { DiscussionItem } from 'src/entities';
import { firebaseService } from '../services/firebase.service';
import { BaseResource } from './base.resource';
import { Entity, Filters } from './localbase/state-db.controller';
import { Observable } from 'rxjs';

class DiscussionResource extends BaseResource<DiscussionItem> {
  protected streamCb(filters?: Filters<Entity> | undefined): void | Observable<DiscussionItem[]> {
    return firebaseService
      .streamWith<DiscussionItem>('discussions', filters && this.arrayFilter(filters) || {});
  }
  protected async getCb(key: string): Promise<boolean | void | DiscussionItem> {
    return await firebaseService.get('discussions', key) as DiscussionItem;
  }
  protected async createCb(data: DiscussionItem): Promise<boolean | void | DiscussionItem> {
    return await firebaseService.create('discussions', data) as DiscussionItem;
  }
  protected async deleteCb(data: DiscussionItem): Promise<boolean | void | DiscussionItem> {
    await firebaseService.delete('discussions', data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(filters?: Filters<Entity> | undefined): Promise<void | DiscussionItem[]> {
    return await firebaseService.findAll('discussions', filters as { [field: string]: string }) as DiscussionItem[];
  }
  protected async updateCb(data: DiscussionItem): Promise<boolean | void | DiscussionItem> {
    await firebaseService.update('discussions', data.id || data.key, data);
  }
  protected patchCb(): Promise<boolean | void | DiscussionItem> {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('discussion')
  }
}
export const discussionResource = new DiscussionResource();
