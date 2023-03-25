import { IBaseEntity } from './base.entity';

export interface IProject extends IBaseEntity {
  key: string;
  name: string;
  description?: string;
  status?: 'active' | 'disabled' | 'closed';
  icon?: string;
  admins: string[];
  members: string[];
  guests: string[];
  pending: string[];
  moderators: string[];
}
