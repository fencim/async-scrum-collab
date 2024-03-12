import { ICeremony, IIteration } from 'src/entities';
import { Struct } from 'src/structs';

export type Iterations =
  | Struct<'newIteration', {
    projectKey: string;
    done?: (iteration: IIteration) => void;
  }>
  | Struct<'editIteration', {
    iteration: IIteration;
    done?: (iteration: IIteration) => void;
  }>
  | Struct<'deleteIterationDialog', {
    iteration: IIteration;
    done?: VoidCallback;
    error?: ErrorCallback;
  }>
  | Struct<'editCeremony', {
    ceremony: ICeremony;
    done?: (ceremony: ICeremony) => void;
  }>;
