import { IProfile } from 'src/entities';
import { firebaseService } from './firebase.service';
import { BaseResource } from './base.resource';
import { Filters, Entity } from './localbase/state-db.controller';

class ProfileResource extends BaseResource<IProfile> {
  protected stream(filters?: Filters<Entity> | undefined): void {
    throw new Error(`Method not implemented.${filters}`);
  }
  protected async getCb(key: string): Promise<boolean | void | IProfile> {
    return await firebaseService.get('profiles', key) as IProfile;
  }
  protected async createCb(data: IProfile): Promise<boolean | void | IProfile> {
    return await firebaseService.create('profiles', data) as IProfile;
  }
  protected async deleteCb(data: IProfile): Promise<boolean | void | IProfile> {
    await firebaseService.delete('profiles', data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(filters?: Filters<Entity> | undefined): Promise<void | IProfile[]> {
    return await firebaseService.findAll('profiles', filters as { [field: string]: string }) as IProfile[];
  }
  protected async updateCb(data: IProfile): Promise<boolean | void | IProfile> {
    await firebaseService.update('profiles', data.id || data.key, data);
    return true;
  }
  protected patchCb(): Promise<boolean | void | IProfile> {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('profile')
  }
}
export const profileResource = new ProfileResource();
