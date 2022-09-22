import { DiscussionItem } from 'src/entities';
import { firebaseService } from './firebase.service';
import { BaseResource } from './base.resource';
import { Entity, Filters } from './localbase/state-db.controller';
import { map, merge, Observable } from 'rxjs';


class DiscussionResource extends BaseResource<DiscussionItem> {
  private streamMap = new Map<string, Observable<DiscussionItem[]>>();
  protected stream(filters?: Filters<Entity> | undefined): Observable<DiscussionItem[]> {
    const filterStr = this.filterToStr(filters);
    let activeStream = this.streamMap.get(filterStr);
    if (activeStream) {
      return activeStream;
    }
    const offline = new Observable<DiscussionItem[]>((subcriber) => {
      this.findAllFrom(filters)
        .then((list) => {
          subcriber.next(list);
          subcriber.complete();
        });
    });
    const online = firebaseService
      .streamWith<DiscussionItem>('discussions', filters && this.arrayFilter(filters) || {})
      .pipe(map(list => {
        this.saveEachTo(list, 'synced');
        return list;
      }));
    activeStream = merge(offline, online);
    activeStream.subscribe({
      error: () => {
        this.streamMap.delete(filterStr);
      }
    });
    this.streamMap.set(filterStr, activeStream);
    return activeStream;
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
