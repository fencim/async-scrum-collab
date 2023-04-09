import { IBaseEntity } from './base.entity';

export interface IProfile extends IBaseEntity {
  key: string;
  name: string;
  avatar: string;
  email?: string;
  emailVerified?: boolean;
}
