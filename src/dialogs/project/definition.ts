import { IProject } from 'src/entities';
import { Struct } from 'src/structs';

export type Projects =
  | Struct<'newProject', {
    done?: (project: IProject) => void;
  }>
  | Struct<'editProject', {
    project: IProject;
    done?: (project: IProject) => void;
  }>;
