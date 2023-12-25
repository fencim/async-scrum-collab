import { IBaseEntity } from './base.entity';
import { IIteration } from './iteration.entities';
import { IMedia } from './media.entities';
import { IProfile } from './profile.entities';
import { IBoardColumn } from './project.entities';
export interface IDiscussion extends IBaseEntity {
  key: string;
  projectKey: string;
  ceremonyKey: string;
  awareness: { [profileKey: string]: string };
  complexity?: number;
  //board
  iteration?: string | IIteration;
  doneDate?: string;
  status?: string;
  responsibilityOf?: string;
  assignedTo?: string | IProfile;
  assignees?: (string | IProfile)[];
  order?: number;
  //planning
  convoCount?: number;
  progress?: number;
  dueDate?: string;
  priority?: number;
  unread?: number;
  info?: string;
  //relations
  parent?: string | DiscussionItem;
  relatesTo?: (string | DiscussionItem)[];
  dependents?: (string | DiscussionItem)[];
}

export interface IGoal extends IDiscussion {
  type: 'goal';
  description: string;
}
export interface IObjective extends IDiscussion {
  type: 'objective';
  description: string;
  specifics?: string;
  mesures?: string;
  enables?: string;
}
export interface TechnicalTask extends IDiscussion {
  type: 'task';
  description: string;
}
export interface IAcceptanceCriteria {
  given: string;
  when: string;
  then: string;
}
export interface IFeature extends IDiscussion {
  type: 'Feature';
  description: string;
  businessValue: number;
}
export interface IStory extends IDiscussion {
  type: 'story';
  forFeature?: string;
  targetUser?: string;
  subject?: string;
  purpose?: string;
  acceptanceCriteria: IAcceptanceCriteria[];
  tasks: (string | TechnicalTask)[]
}
export interface IRoadBlock extends IDiscussion {
  type: 'roadblock';
  description: string;
  label: string;
  resolution?: string;
}

export interface IScrumReport extends IDiscussion {
  type: 'scrum';
  reporter: string | IProfile;
  tasksDid: (string | DiscussionItem)[];
  todoTasks: (string | DiscussionItem)[];
  roadblocks: (string | DiscussionItem)[];
}

export interface ISprintReport extends IDiscussion {
  type: 'report';
  refPlanning?: string;
  attachments?: string[];
}

export interface ISprintDemo extends IDiscussion {
  type: 'demo';
  refKey?: string;
  attachments?: string[];
}

export interface IWentWell extends IDiscussion {
  type: 'went-well';
  comments: string[]
}
export interface IWentWrong extends IDiscussion {
  type: 'went-wrong';
  comments: string[]
}
export interface IToImprove extends IDiscussion {
  type: 'to-improve';
  comments: string[]
}
export interface IActionItem extends IDiscussion {
  type: 'action-item';
  owner: string;
  description: string;
}
export type PlanningItem = IStory | IGoal | IObjective | TechnicalTask;
export type DailyScrumItem = IScrumReport | IRoadBlock;
export type ReviewItem = ISprintReport | ISprintDemo;
export type RetroItem = IWentWell | IWentWrong | IToImprove | IActionItem;
export type DiscussionItem = PlanningItem | DailyScrumItem | ReviewItem | RetroItem;

export interface ISprintBoardColumn extends IBoardColumn {
  tasks: PlanningItem[];
}

export interface IProgressFeedback { progress: number; feedback: string }

export interface IDiscusssionMail {
  from: string | IProfile;
  recepient: string | IProfile;
  to: (string | IProfile)[];
  subject: string;
  message: string;
  dateSent: string;
  attachments: (string | IMedia)[];
  dateRead?: string;
  reference?: string | DiscussionItem
}
