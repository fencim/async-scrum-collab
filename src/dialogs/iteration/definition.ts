import { IIteration } from 'src/entities';
import { Struct } from 'src/structs';

export type Iterations =
  | Struct<'newIteration', {
    projectKey: string;
    done?: (iteration: IIteration) => void;
  }>
  | Struct<'editIteration', {
    iteration: IIteration;
    done?: (iteration: IIteration) => void;
  }>;
