export type CeremonyType = 'planning' | 'review' | 'scrum' | 'retro';
export interface ICeremony {
    key: string;
    projectKey: string;
    iterationKey: string;
    type: CeremonyType;
    start: string;
    end: string;
    progress?: number;
    discussions: string[];
}