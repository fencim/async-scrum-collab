import { Convo } from 'src/entities';
import { firebaseService } from './firebase.service';
import { BaseResource } from './base.resource';
import { Entity, Filters } from './localbase/state-db.controller';

class ConvoResource extends BaseResource<Convo> {
  protected async getCb(key: string): Promise<boolean | void | Convo> {
    return await firebaseService.get('convos', key) as Convo
  }
  protected async createCb(data: Convo): Promise<boolean | void | Convo> {
    return await firebaseService.create('convos', data) as Convo;
  }
  protected async deleteCb(data: Convo): Promise<boolean | void | Convo> {
    await firebaseService.delete('convos', data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    await firebaseService.deleteCollection('convos');
    return true;
  }
  protected async getAllCb(filters?: Filters<Entity> | undefined): Promise<void | Convo[]> {
    await firebaseService.findAll('convos', filters as { [field: string]: string }) as Convo[]
  }
  protected async updateCb(data: Convo): Promise<boolean | void | Convo> {
    await firebaseService.update('convos', data.id || data.key, data);
    return true;
  }
  protected patchCb(): Promise<boolean | void | Convo> {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('convo')
  }

}
export const convoResource = new ConvoResource();
