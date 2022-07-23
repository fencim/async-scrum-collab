import { IProject } from 'src/entities';
import { firebaseService } from './firebase.service';
import { LocalBaseService } from './localbase.services';
import { Entity, Filters } from './localbase/state-db.controller';

class ProjectService extends LocalBaseService<IProject> {
  constructor() {
    super('project')
  }
  getAllCb?: (filters?: Filters<Entity>) => Promise<IProject[]> = async (filter) => {
    return await firebaseService.findAll('projects', filter as { [field: string]: string }) as IProject[];
  }
  createCb?: ((data: IProject) => Promise<void | boolean | IProject>) | undefined = async (data) => {
    try {
      return await firebaseService.create('projects', data) as IProject;
    } catch (e) {
      console.log(e);
    }
  }
  updateCb?: ((data: IProject) => Promise<void | boolean>) | undefined = async (data) => {
    try {
      await firebaseService.update('projects', data.id || data.key, data);
      return true;
    } catch {
      return false;
    }
  }
  deleteCb?: ((data: IProject) => Promise<void | boolean>) | undefined = async (data) => {
    try {
      await firebaseService.update('projects', data.id || data.key, data);
      return true;
    } catch {
      return false;
    }
  }
  deleteAllCb?: (() => Promise<void | boolean>) | undefined = async () => {
    try {
      await firebaseService.deleteCollection('projects');
      return true;
    } catch {
      return false;
    }
  }
}
export const projectService = new ProjectService();
