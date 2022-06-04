import { LocalBaseService } from './localbase.services';
import { IProfile } from './profiles.services';

export interface IAttachment {
    type: 'audio' | 'doc',
    url: string;
}
export interface IMessage {
    key: string;
    discussion: string;
    projectKey: string;
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

class ConvoService extends LocalBaseService<Convo> {
    constructor() {
        super('convo')
    }
    saveCb?: ((data: Convo) => Promise<void>) | undefined = async () => {
        // console.log('save convo', data);
    }
    updateCb?: ((data: Convo) => Promise<void>) | undefined = async (data) => {
        console.log('update convo', data);
    }
    deleteCb?: ((data: Convo) => Promise<void>) | undefined = async (data) => {
        console.log('delete convo', data);
    }
    deleteAllCb?: (() => Promise<void>) | undefined = async () => {
        console.log('delete all convos');
    }
}
export const convoService = new ConvoService();