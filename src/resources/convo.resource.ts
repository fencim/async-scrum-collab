import { Convo, ConvoList } from 'src/entities';
import { firebaseService } from './firebase.service';
import { BaseResource } from './base.resource';
import { Entity, Filters } from './localbase/state-db.controller';
import { Observable } from 'rxjs';

class ConvoResource extends BaseResource<Convo> {
  protected streamCb(filters?: Filters<Entity> | undefined): void | Observable<Convo[]> {
    return firebaseService
      .streamWith<Convo>('convos', filters
        && this.arrayFilter(filters) ||
        (typeof filters == 'object' && filters as { [key: string]: string }) || {});
  }
  protected getKeyOf(v: Convo): string {
    const initials = v.type[0].toUpperCase();
    return initials + this.hashName(v.date + v.type);
  }
  protected async getCb(key: string): Promise<boolean | void | Convo> {
    return await firebaseService.get('convos', key) as Convo
  }
  protected async createCb(data: Convo): Promise<boolean | void | Convo> {
    data.key = this.getKeyOf(data);
    return await firebaseService.create('convos', data) as Convo;
  }
  protected async deleteCb(data: Convo): Promise<boolean | void | Convo> {
    await firebaseService.delete('convos', data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(filters?: Filters<Entity> | undefined): Promise<void | ConvoList> {
    return await firebaseService.findAll('convos', filters as { [field: string]: string }) as ConvoList
  }
  protected async updateCb(data: Convo): Promise<boolean | void | Convo> {
    data.key = data.id || data.key || this.getKeyOf(data);
    await firebaseService.update('convos', data.key, data);
    return true;
  }
  protected patchCb(): Promise<boolean | void | Convo> {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('convo', 'key')
  }

}
export const convoResource = new ConvoResource();
convoResource.resumeSyncing();
