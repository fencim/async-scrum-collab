import { IBaseEntity } from './base.entity';

export type CeremonyType = 'planning' | 'review' | 'scrum' | 'retro';

interface IBaseCeremony extends IBaseEntity {
  key: string;
  projectKey: string;
  iterationKey: string;
  start: string;
  end: string;
  confidence?: number;
  progress?: number;
  discussions: string[];
}
interface IPlanningCeremony extends IBaseCeremony {
  type: 'planning';
  totalCommitted?: number;
}
interface IReviewCeremony extends IBaseCeremony {
  type: 'review'
  targetMissed?: number;
}
interface IScrumCeremony extends IBaseCeremony {
  type: 'scrum'
  totalUnplanned?: number;
  targetMissed?: number;
  totalCompleted?: number;
}
interface IRetroCeremony extends IBaseCeremony {
  type: 'retro'
}
export type ICeremony = IPlanningCeremony | IReviewCeremony | IScrumCeremony | IRetroCeremony

