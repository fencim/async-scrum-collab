import { IBaseEntity } from './base.entity';

export interface IProject extends IBaseEntity {
  key: string;
  name: string;
  description?: string;
  icon?: string;
  members: string[];
}
