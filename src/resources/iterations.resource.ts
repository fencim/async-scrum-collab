import { IIteration } from 'src/entities';
import { firebaseService } from './firebase.service';
import { BaseResource } from './base.resource';
import { Entity, Filters } from './localbase/state-db.controller';

class IterationResource extends BaseResource<IIteration> {
  protected stream(filters?: Filters<Entity> | undefined): void {
    throw new Error(`Method not implemented.${filters}`);
  }
  protected async getCb(key: string): Promise<boolean | void | IIteration> {
    return await firebaseService.get('iterations', key) as IIteration;
  }
  protected async createCb(data: IIteration): Promise<boolean | void | IIteration> {
    return await firebaseService.create('iterations', data) as IIteration;
  }
  protected async deleteCb(data: IIteration): Promise<boolean | void | IIteration> {
    await firebaseService.delete('iterations', data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(filters?: Filters<Entity> | undefined): Promise<void | IIteration[]> {
    return await firebaseService.findAll('iterations', filters as { [field: string]: string }) as IIteration[];
  }
  protected async updateCb(data: IIteration): Promise<boolean | void | IIteration> {
    await firebaseService.update('iterations', data.id || data.key, data);
    return true;
  }
  protected patchCb(): Promise<boolean | void | IIteration> {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('iteration')
  }
}
export const iterationResource = new IterationResource();