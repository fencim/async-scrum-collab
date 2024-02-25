import { IBaseEntity } from './base.entity';
import { IProfile } from './profile.entities'
import { IProject } from './project.entities';

export interface TransactionLogs<D extends IBaseEntity> extends IBaseEntity {
  key?: string;
  operator: string | IProfile;
  project: string | IProject;
  date: string;
  kind: 'operation' | 'post-operation' | 'query' | 'console';
  type: string;
  data: D | D[]
}
export type ILoggable = TransactionLogs<IBaseEntity> & { key: string };

export interface ILogCounter extends IBaseEntity {
  key: string;
  /** sumOfSomeField | countOfSomeField | averageOfSomeField */
  variable: string;
  filter: Record<string, string>;
  value: number;
}
