import { IProject } from 'src/entities';
import { LocalBaseService } from './localbase.services';

class ProjectService extends LocalBaseService<IProject> {
  constructor() {
    super('project')
  }
  saveCb?: ((data: IProject) => Promise<void>) | undefined = async (data) => {
    console.log('save project', data);
  }
  updateCb?: ((data: IProject) => Promise<void>) | undefined = async (data) => {
    console.log('update project', data);
  }
  deleteCb?: ((data: IProject) => Promise<void>) | undefined = async (data) => {
    console.log('delete project', data);
  }
  deleteAllCb?: (() => Promise<void>) | undefined = async () => {
    console.log('delete all projects');
  }
}
export const projectService = new ProjectService();
