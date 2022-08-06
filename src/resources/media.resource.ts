import { IMedia } from 'src/entities';
import { firebaseService } from './firebase.service';
import { BaseResource } from './base.resource';
import { Entity, Filters } from './localbase/state-db.controller';

class MediaResource extends BaseResource<IMedia> {
  protected async createCb(data: IMedia): Promise<boolean | void | IMedia> {
    return await firebaseService.create('medias', data) as IMedia;
  }
  protected async deleteCb(data: IMedia): Promise<boolean | void | IMedia> {
    await firebaseService.delete('medias', data.id || data.key);
    return true;
  }
  protected deleteAllCb(): Promise<boolean | void> {
    throw new Error('Method not implemented.');
  }
  protected async getAllCb(filters?: Filters<Entity> | undefined): Promise<void | IMedia[]> {
    return await firebaseService.findAll('medias', filters as { [field: string]: string }) as IMedia[];
  }
  protected async updateCb(data: IMedia): Promise<boolean | void | IMedia> {
    await firebaseService.update('medias', data.id || data.key, data);
    return true;
  }
  protected patchCb(): Promise<boolean | void | IMedia> {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('media')
  }


}
export const mediaResource = new MediaResource();
