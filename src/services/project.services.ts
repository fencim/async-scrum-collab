import { LocalBaseService } from './localbase.services';
export interface IProject {
    key: string;
    name: string;
    description?: string;
    icon?: string;
    members: string[];
}
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