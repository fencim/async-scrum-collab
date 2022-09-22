import { IIteration } from 'src/entities';
import { firebaseService } from './firebase.service';
import { BaseResource } from './base.resource';
import { Entity, Filters } from './localbase/state-db.controller';
import { Observable, map, merge } from 'rxjs';

class IterationResource extends BaseResource<IIteration> {
  streamMap = new Map<string, Observable<IIteration[]>>();
  stream(filters?: Filters<Entity> | undefined): Observable<IIteration[]> {
    const filterStr = this.filterToStr(filters);
    let activeStream = this.streamMap.get(filterStr);
    if (activeStream) {
      return activeStream;
    }
    const offline = new Observable<IIteration[]>((subcriber) => {
      this.findAllFrom(filters)
        .then((list) => {
          subcriber.next(list);
          subcriber.complete();
        });
    });
    const online = firebaseService.streamWith<IIteration>('iterations', filters && this.arrayFilter(filters) ||
      (typeof filters == 'object' && filters as { [key: string]: string }) || {})
      .pipe(map(list => {
        this.saveEachTo(list, 'synced');
        return list;
      }));
    activeStream = merge(offline, online);
    activeStream.subscribe({
      error: () => {
        this.streamMap.delete(filterStr);
      }
    });
    this.streamMap.set(filterStr, activeStream);
    return activeStream;
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
