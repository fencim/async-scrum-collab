import { IProject } from 'src/entities';
import { Struct } from 'src/structs';

type UpdateSettings<P extends keyof IProject> = {
  project: string | IProject,
  settings: P;
  value: IProject[P]
  done?: (project: IProject) => void
};


export type Project =
  | Struct<'createProject', {
    project: IProject;
    icon?: File;
    done?: (project: IProject) => void,
  }>
  | Struct<'updateProject', {
    project: IProject;
    icon?: File;
    done?: (project: IProject) => void
  }>
  | Struct<'updateProjectSettings', UpdateSettings<keyof IProject>>;

