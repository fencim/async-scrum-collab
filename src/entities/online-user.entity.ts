import { IBaseEntity } from './base.entity';

export interface IOnlineUser extends IBaseEntity {
  key: string;
  organization?: string;
  activeProject?: string;
  activeIteration?: string;
  activeCeremony?: string;
  activeDiscussion?: string;
  activeConvos?: Record<string, string>;
  status?: string;
  lastActivityTime?: string;
}
