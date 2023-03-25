import { IBaseEntity } from './base.entity';
import { IIteration } from './iteration.entities';
import { IProject } from './project.entities';

export interface IBaseActivityLog extends IBaseEntity {
  key: string;
  date: string;
  user: string;
}
/**Auth Activities */
//Login
export interface IAuthLoginActivityLog extends IBaseActivityLog {
  type: 'auth-login';
  username: string;
}
//Logout
export interface IAuthLogoutActivityLog extends IBaseActivityLog {
  type: 'auth-logout';
  username: string;
}
export type IAuthActivityLogs =
  | IAuthLoginActivityLog
  | IAuthLogoutActivityLog;

/**
 * Project Activities
 */

//Create Project
export interface IProjecctCreateActivityLog extends IBaseActivityLog {
  type: 'project-create'
  project: IProject;
}
//Modify Project
export interface IProjectModifyActivityLog extends IBaseActivityLog {
  type: 'project-modify';
  projectKey: string;
  field: keyof IProject;
  oldValue?: string;
  newValue?: string;
}
//Add Members
export interface IProjectAddMemberActivityLog extends IBaseActivityLog {
  type: 'project-add-member';
  projectKey: string;
  newMember: string;
}

//Join Project
export interface IProjectJoinActivityLog extends IBaseActivityLog {
  type: 'project-join';
  projectKey: string;
}
//Approve Membership
export interface IProjectApproveMembershipActivityLog extends IBaseActivityLog {
  type: 'project-approve-membership';
  projectKey: string;
  newMember: string;
}

//Set User as Admin
export interface IProjectSetAsAdminActivityLog extends IBaseActivityLog {
  type: 'project-set-as-admin';
  projectKey: string;
  member: string;
}
//Set User as Moderator
export interface IProjectSetAsModeratorActivityLog extends IBaseActivityLog {
  type: 'project-set-as-moderator';
  projectKey: string;
  member: string;
}
//Set User as Guest
export interface IProjectSetAsGuestActivityLog extends IBaseActivityLog {
  type: 'project-set-as-guest';
  projectKey: string;
  member: string;
}
//Disable Project
export interface IProjectDisableActivityLog extends IBaseActivityLog {
  type: 'project-disable';
  projectKey: string;
}
//Close Project
export interface IProjectCloseActivityLog extends IBaseActivityLog {
  type: 'project-close';
  projectKey: string;
}

export type IProjectActivityLog =
  | IProjecctCreateActivityLog
  | IProjectModifyActivityLog
  | IProjectAddMemberActivityLog
  | IProjectJoinActivityLog
  | IProjectApproveMembershipActivityLog
  | IProjectSetAsAdminActivityLog
  | IProjectSetAsModeratorActivityLog
  | IProjectSetAsGuestActivityLog
  | IProjectDisableActivityLog
  | IProjectCloseActivityLog;

/** Iteration Activities */

//*Add Iteration
//Create Iterations
export interface IIterationCreateActivityLog extends IBaseActivityLog {
  type: 'iteration-create';
  iteration: IIteration;
}
//Activate Iteration
export interface IIterationActivateActivityLog extends IBaseActivityLog {
  type: 'iteration-activate';
  iterationKey: string;
}
//Close Iteration
export interface IIterationCloseActivityLog extends IBaseActivityLog {
  type: 'iteration-close';
  iterationKey: string;
}
//Close Iteration
export interface IIterationReOpenActivityLog extends IBaseActivityLog {
  type: 'iteration-reopen';
  iterationKey: string;
}

//*Add Ceremony

/** Ceremony Activities */

//Create Ceremony
//start ceremony
//schedule ceremony
//accept schedule
//progress changed
//add discussion
