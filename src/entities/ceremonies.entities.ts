import { IBaseEntity } from './base.entity';

export type CeremonyType = 'planning' | 'review' | 'scrum' | 'retro';
export interface ICeremony extends IBaseEntity {
  key: string;
  projectKey: string;
  iterationKey: string;
  type: CeremonyType;
  start: string;
  end: string;
  confidence?: number;
  progress?: number;
  discussions: string[];
}
