import { ICeremony } from 'src/entities';
import { firebaseService } from './firebase.service';
import { BaseResource } from './base.resource';
import { Entity, Filters } from './localbase/state-db.controller';

class CeremonyResource extends BaseResource<ICeremony> {
  protected async createCb(data: ICeremony): Promise<boolean | void | ICeremony> {
    try {
      return await firebaseService.create('ceremonies', data) as ICeremony;
    } catch (e) {
      console.log(e);
    }
  }
  protected async deleteCb(data: ICeremony): Promise<boolean | void | ICeremony> {
    await firebaseService.delete('ceremonies', data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    await firebaseService.deleteCollection('ceremonies');
    return true;
  }
  protected async getAllCb(filters?: Filters<Entity> | undefined): Promise<void | ICeremony[]> {
    return await firebaseService.findAll('ceremonies', filters as { [field: string]: string }) as ICeremony[];
  }
  protected async updateCb(data: ICeremony): Promise<boolean | void | ICeremony> {
    await firebaseService.update('ceremonies', data.id || data.key, data);
    return true;
  }
  protected patchCb(): Promise<boolean | void | ICeremony> {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('ceremony')
  }
}
export const ceremonyResource = new CeremonyResource();
