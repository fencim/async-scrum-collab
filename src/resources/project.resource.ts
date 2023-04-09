import { IProject } from 'src/entities';
import { firebaseService } from './firebase.service';
import { BaseResource } from './base.resource';
import { Entity, Filters } from './localbase/state-db.controller';
import { Observable } from 'rxjs';
import { logsResource } from './logs.resource';

class ProjectResource extends BaseResource<IProject> {
  protected streamCb(filters?: Filters<Entity> | undefined): void | Observable<IProject[]> {
    return firebaseService.streamWith<IProject>('projects', filters && this.arrayFilter(filters) ||
      (typeof filters == 'object' && filters as { [key: string]: string }) || {});
  }
  protected async getCb(key: string): Promise<boolean | void | IProject> {
    return await firebaseService.get('projects', key) as IProject;
  }
  protected async createCb(data: IProject): Promise<boolean | void | IProject> {
    const result = await firebaseService.create('projects', data) as IProject;
    await logsResource.setData('', {
      type: 'project-create',
      project: data
    })
    return result;
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
projectResource.resumeSyncing();
