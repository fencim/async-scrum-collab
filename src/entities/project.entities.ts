import { IBaseEntity } from './base.entity';

export interface IBoardColumn {
  key: string;
  name: string;
  doneState?: boolean;
  icon?: string;
  color?: string;
}
export interface IProject extends IBaseEntity {
  key: string;
  name: string;
  description?: string;
  status?: 'active' | 'disabled' | 'closed';
  discussionReadiness?: number;
  icon?: string;
  admins: string[];
  members: string[];
  guests: string[];
  pending: string[];
  moderators: string[];
  boardColumns?: IBoardColumn[];
}
