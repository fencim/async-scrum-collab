import { firebaseService } from '../services/firebase.service';
import { BaseResource, DocStatus, StatusUpdate } from './base.resource';
import { Entity, Filters } from './localbase/state-db.controller';
import { Observable } from 'rxjs';
import { IActivityLog } from 'src/entities';
// import { useProfilesStore } from 'src/stores/profiles.store';

class LogsResource extends BaseResource<IActivityLog> {
  userKey?: string;
  protected streamCb(filters?: Filters<Entity> | undefined): void | Observable<IActivityLog[]> {
    return firebaseService
      .streamWith<IActivityLog>('logs', filters
        && this.arrayFilter(filters) ||
        (typeof filters == 'object' && filters as { [key: string]: string }) || {});
  }
  protected getKeyOf(v: IActivityLog): string {
    const initials = v.type[0].toUpperCase();
    return initials + this.hashName(v.date + v.type);
  }
  protected async getCb(key: string): Promise<boolean | void | IActivityLog> {
    return await firebaseService.get('logs', key) as IActivityLog
  }
  protected async createCb(data: IActivityLog): Promise<boolean | void | IActivityLog> {

    return await firebaseService.create('logs', data) as IActivityLog;
  }
  protected async deleteCb(): Promise<boolean | void | IActivityLog> {
    throw new Error('Method not implemented.');
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(filters?: Filters<Entity> | undefined): Promise<void | IActivityLog[]> {
    return await firebaseService.findAll('logs', filters as { [field: string]: string }) as IActivityLog[]
  }
  protected async updateCb(): Promise<boolean | void | IActivityLog> {
    throw new Error('Method not implemented.');
  }
  protected patchCb(): Promise<boolean | void | IActivityLog> {
    throw new Error('Method not implemented.');
  }
  setData(
    key: string,
    value: IActivityLog,
    createOnlyOrStatus?: boolean | DocStatus,
    cb?: ((status: StatusUpdate) => void) | undefined, remarks?: string | undefined):
    Promise<IActivityLog | undefined> {
    value.user = this.userKey || value.user;
    value.date = (new Date()).toISOString();
    value.key = this.getKeyOf(value);
    return super.setData(key, value, createOnlyOrStatus, cb, remarks);
  }
  constructor() {
    super('logs', 'key')
  }

}
export const logsResource = new LogsResource();
