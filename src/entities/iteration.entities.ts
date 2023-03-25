import { IBaseEntity } from './base.entity';

export interface IIteration extends IBaseEntity {
  key: string;
  projectKey: string;
  status?: 'open' | 'active' | 'closed';
  name: string;
  start: string;
  end: string;
}
