import { IBaseEntity } from './base.entity';

export type CeremonyType = 'planning' | 'review' | 'scrum' | 'retro';

export interface IBaseCeremony extends IBaseEntity {
  key: string;
  projectKey: string;
  iterationKey: string;
  start: string;
  end: string;
  confidence?: number;
  progress?: number;
  discussions: string[];
}
export interface IPlanningCeremony extends IBaseCeremony {
  type: 'planning';
  totalCommitted?: number;
}
export interface IReviewCeremony extends IBaseCeremony {
  type: 'review'
  targetMissed?: number;
}
export interface IScrumCeremony extends IBaseCeremony {
  type: 'scrum'
  totalUnplanned?: number;
  targetMissed?: number;
  totalCompleted?: number;
}
export interface IRetroCeremony extends IBaseCeremony {
  type: 'retro'
}
export type ICeremony = IPlanningCeremony | IReviewCeremony | IScrumCeremony | IRetroCeremony
export const CeremonyTypes: ICeremony['type'][] = ['planning', 'retro', 'scrum', 'review'] as const;
