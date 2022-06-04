export interface IDiscussion {
    key: string;
    projectKey: string;
    ceremonyKey: string;
    awareness: { [profileKey: string]: string };
    progress?: number;
    unread?: number;
}

export interface IGoal extends IDiscussion {
    type: 'goal';
    description: string;
}
export interface IObjective extends IDiscussion {
    type: 'objective';
    goalKey: string;
    description: string;
    specifics?: string;
    mesures?: string;
    enables?: string;
    due?: string;
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
export interface IStory extends IDiscussion {
    type: 'story';
    targetUser?: string;
    subject?: string;
    purpose?: string;
    acceptanceCriteria: IAcceptanceCriteria[];
    tasks: (string | TechnicalTask)[]
}
export type DiscussionItem = IStory | IGoal | IObjective | TechnicalTask;
