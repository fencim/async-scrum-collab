import { PlanningItem } from 'src/entities';

export const dummyData: { name: string; tasks: PlanningItem[]; }[] = [
  {
    name: 'To Do',
    tasks: [
      {
        key: 'test',
        type: 'story',
        acceptanceCriteria: [
          {
            given: 'I am valid user',
            when: 'go to home page',
            then: 'I should see the dashboard',
          },
        ],
        awareness: {},
        ceremonyKey: '',
        projectKey: '',
        tasks: [],
        subject: 'do this',
        purpose: 'test',
        targetUser: 'user',
      },
    ],
  },
  {
    name: 'In Progress',
    tasks: [
      {
        key: 'test2',
        type: 'goal',
        awareness: {},
        ceremonyKey: '',
        description: 'Testing',
        projectKey: 'PR',
      },
    ],
  },
  {
    name: 'Done', tasks: [{
      type: 'objective',
      description: 'objective',
      specifics: 'to be',
      mesures: 'at least 1',
      enables: 'new op',
      due: 'any time',
      goalKey: 'test2',
      key: 'obj1',
      projectKey: 'PR',
      awareness: {},
      ceremonyKey: '',
    }, {
      type: 'task',
      key: 'task1',
      description: 'Tech task',
      projectKey: 'PR',
      awareness: {},
      ceremonyKey: '',
    }]
  },
];
