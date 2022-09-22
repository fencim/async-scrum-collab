import { ICeremony } from 'src/entities';
import { firebaseService } from './firebase.service';
import { BaseResource } from './base.resource';
import { Entity, Filters } from './localbase/state-db.controller';
import { Observable, map, merge } from 'rxjs';

class CeremonyResource extends BaseResource<ICeremony> {
  private streamMap = new Map<string, Observable<ICeremony[]>>();
  stream(filters?: Filters<Entity> | undefined): Observable<ICeremony[]> {
    const filterStr = this.filterToStr(filters);
    let activeStream = this.streamMap.get(filterStr);
    if (activeStream) {
      return activeStream;
    }
    const offline = new Observable<ICeremony[]>((subcriber) => {
      this.findAllFrom(filters)
        .then((list) => {
          subcriber.next(list);
          subcriber.complete();
        });
    });
    const online = firebaseService.streamWith<ICeremony>('ceremonies', filters && this.arrayFilter(filters) ||
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
    super('ceremony')
  }
}
export const ceremonyResource = new CeremonyResource();
