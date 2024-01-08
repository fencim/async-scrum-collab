import { IBaseEntity } from './base.entity';
import { IProfile } from './profile.entities';

export interface IAttachment {
  type: 'audio' | 'doc' | 'image',
  url: string;
}
export interface IMessage extends IBaseEntity {
  key: string;
  discussion: string;
  projectKey: string;
  iteration: string;
  date: string;
  message: string;
  from: string | IProfile;
  status?: 'saved' | 'sent' | 'updated';
  attachments?: IAttachment[]
}
export interface IInfo extends IMessage {
  type: 'message'
}
export interface IQuestion extends IMessage {
  type: 'question';
  resolved?: boolean;
}
export interface IResponse extends IMessage {
  type: 'response';
  ref: string;
  feedback: { [user: string]: ('agree' | 'disagree') };
}
export interface IPoll extends IMessage {
  type: 'poll'
  choices: string[]
  answers: { author: string, answer: string }[]
  resolution: string;
}
export interface IVote extends IMessage {
  type: 'vote';
  ref: string;
  vote: string;
}
export interface IReaction extends IMessage {
  type: 'reaction'
  reaction: 'approve' | string;
}
export type Convo = IInfo | IQuestion | IResponse | IPoll | IVote;
export type ConvoList = Convo[];
