import { IProject } from 'src/entities';
import { firebaseService } from './firebase.service';
import { BaseResource } from './base.resource';
import { Entity, Filters } from './localbase/state-db.controller';
import { map, merge, Observable } from 'rxjs';

class ProjectResource extends BaseResource<IProject> {
  private activeStream?: Observable<IProject[]>;
  stream(filters?: Filters<Entity> | undefined): Observable<IProject[]> {
    if (this.activeStream && this.activeStream) {
      return this.activeStream;
    }
    const offline = new Observable<IProject[]>((subcriber) => {
      this.findAllFrom(filters)
        .then((list) => {
          subcriber.next(list);
          subcriber.complete();
        });
    });
    const online = firebaseService.streamWith<IProject>('projects', filters && this.arrayFilter(filters) ||
      (typeof filters == 'object' && filters as { [key: string]: string }) || {})
      .pipe(map(list => {
        this.saveEachTo(list, 'synced');
        return list;
      }));
    this.activeStream = merge(offline, online);
    this.activeStream.subscribe({
      error: () => {
        this.activeStream = undefined;
      }
    });
    return this.activeStream;
  }
  protected async getCb(key: string): Promise<boolean | void | IProject> {
    return await firebaseService.get('projects', key) as IProject;
  }
  protected async createCb(data: IProject): Promise<boolean | void | IProject> {
    return await firebaseService.create('projects', data) as IProject;
  }
  protected async deleteCb(data: IProject): Promise<boolean | void | IProject> {
    await firebaseService.delete('projects', data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(filters?: Filters<Entity> | undefined): Promise<void | IProject[]> {
    return await firebaseService.findAll('projects', filters as { [field: string]: string }) as IProject[];
  }
  protected async updateCb(data: IProject): Promise<boolean | void | IProject> {
    await firebaseService.update('projects', data.id || data.key, data);
    return true;
  }
  protected patchCb(): Promise<boolean | void | IProject> {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('project')
  }
}
export const projectResource = new ProjectResource();
