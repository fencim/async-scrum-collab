export interface IDiscussion {
    key: string;
    projectKey: string;
    ceremonyKey: string;
    awareness: { [profileKey: string]: string };
    complexity?: number;
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
    reporter: string;
    tasksDid: string[];
    todoTasks: string[];
    roadblocks: string[];
}

export type DiscussionItem = IStory | IGoal | IObjective | TechnicalTask | IScrumReport | IRoadBlock;
