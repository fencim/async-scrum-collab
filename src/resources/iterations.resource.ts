import { IIteration } from 'src/entities';
import { firebaseService } from '../services/firebase.service';
import { BaseResource } from './base.resource';
import { Entity, Filters } from './localbase/state-db.controller';
import { Observable } from 'rxjs';
import { logsResource } from './logs.resource';

class IterationResource extends BaseResource<IIteration> {
  protected streamCb(filters?: Filters<Entity> | undefined): Observable<IIteration[]> {
    return firebaseService.streamWith<IIteration>('iterations', filters && this.arrayFilter(filters) ||
      (typeof filters == 'object' && filters as { [key: string]: string }) || {});
  }
  protected async getCb(key: string): Promise<boolean | void | IIteration> {
    return await firebaseService.get('iterations', key) as IIteration;
  }
  protected async createCb(data: IIteration): Promise<boolean | void | IIteration> {
    const result = await firebaseService.create('iterations', data) as IIteration;
    if (result) {
      logsResource.setData('', {
        type: 'iteration-create',
        projectKey: result.projectKey,
        iteration: result
      })
    }
    return result;
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
