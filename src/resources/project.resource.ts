import { IProject } from 'src/entities';
import { FbBaseResource } from './fb-base.resource';

class ProjectResource extends FbBaseResource<IProject> {
  constructor() {
    super('projects')
  }
}
export const projectResource = new ProjectResource();
