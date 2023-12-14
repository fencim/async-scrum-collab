import { IProject } from 'src/entities';
import { Struct } from 'src/structs';

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
  }>;
