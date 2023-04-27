import { firebaseService } from '../services/firebase.service';
import { BaseResource } from './base.resource';
import { Filters, Entity } from './localbase/state-db.controller';
import { Observable } from 'rxjs';
import { IOnlineUser } from 'src/entities';

class OnlineUsersResource extends BaseResource<IOnlineUser> {
  protected streamCb(filters?: Filters<Entity> | undefined): void | Observable<IOnlineUser[]> {
    return firebaseService.streamWith<IOnlineUser>('online', filters && this.arrayFilter(filters) ||
      (typeof filters == 'object' && filters as { [key: string]: string }) || {});
  }
  protected async getCb(key: string): Promise<boolean | void | IOnlineUser> {
    return await firebaseService.get('online', key) as IOnlineUser;
  }
  protected async createCb(data: IOnlineUser): Promise<boolean | void | IOnlineUser> {
    return await firebaseService.create('online', data) as IOnlineUser;
  }
  protected async deleteCb(data: IOnlineUser): Promise<boolean | void | IOnlineUser> {
    await firebaseService.delete('online', data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(filters?: Filters<Entity> | undefined): Promise<void | IOnlineUser[]> {
    return await firebaseService.findAll('online', filters as { [field: string]: string }) as IOnlineUser[];
  }
  protected async updateCb(data: IOnlineUser): Promise<boolean | void | IOnlineUser> {
    await firebaseService.update('online', data.id || data.key, data);
    return true;
  }
  protected patchCb(): Promise<boolean | void | IOnlineUser> {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('online')
  }
}
export const onlineUsersResource = new OnlineUsersResource();
