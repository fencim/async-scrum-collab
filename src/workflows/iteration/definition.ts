import { CeremonyType, IIteration } from 'src/entities';
import { Struct } from 'src/structs';
export type Schedule = {
  key: string;
  desc: string;
  start: Date;
  end: Date;
  check: boolean;
  type: CeremonyType;
};

export type Iteration =
  | Struct<'createIteration', {
    details: Omit<IIteration, 'key'>,
    done: (iteration: IIteration) => void,
    progress?: (progress: number, details?: string) => void;
    ceremonies?: Schedule[]
  }>
  | Struct<'updateIteration', {
    iteration: IIteration,
    done?: (iteration: IIteration) => void
  }>;
