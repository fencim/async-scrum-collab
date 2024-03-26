import { IBaseEntity } from './base.entity';
export type MembershipType = 'pending' | 'admin' | 'moderator' | 'member' | 'guest' | 'anonymous';
export interface IProfile extends IBaseEntity {
  key: string;
  name: string;
  avatar: string;
  email?: string;
  emailVerified?: boolean;
  activeProject?: string;
  projects?: string[];
}
