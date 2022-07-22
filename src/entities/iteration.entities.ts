import { IBaseEntity } from './base.entity';

export interface IIteration extends IBaseEntity {
  key: string;
  projectKey: string;
  name: string;
  start: string;
  end: string;
}
