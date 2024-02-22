import { ICeremony } from 'src/entities';
import { firebaseService } from '../services/firebase.service';
import { BaseResource } from './base.resource';
import { Entity, Filters } from './localbase/state-db.controller';
import { Observable } from 'rxjs';

class CeremonyResource extends BaseResource<ICeremony> {
  protected streamCb(filters?: Filters<Entity> | undefined): void | Observable<ICeremony[]> {
    return firebaseService.streamWith<ICeremony>('ceremonies', filters && this.arrayFilter(filters) ||
      (typeof filters == 'object' && filters as { [key: string]: string }) || {});
  }

  protected async getCb(key: string): Promise<boolean | void | ICeremony> {
    return await firebaseService.get('ceremonies', key) as ICeremony;
  }
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
    super('ceremonies')
  }
}
export const ceremonyResource = new CeremonyResource();
