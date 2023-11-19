import { defineStore } from 'pinia';
import { from, switchMap } from 'rxjs';
import {
  ConvoList,
  DiscussionItem,
  ICeremony, IDiscussion,
  IProject, IQuestion, ISprintBoardColumn, IToImprove, IVote, IWentWell, IWentWrong,
  PlanningItem,
  RetroItem, IBoardColumn, IIteration
} from 'src/entities';
import { discussionResource } from 'src/resources/discussions.resource';
import { useCeremonyStore } from './cermonies.store';
import { useProfilesStore } from './profiles.store';
import { useProjectStore } from './projects.store';
import { useIterationStore } from './iterations.store';

interface IDiscussionState {
  discussions: DiscussionItem[];
  activeDiscussion?: DiscussionItem;
}

export const useDiscussionStore = defineStore('discussion', {
  state: () => ({
    discussions: []
  } as IDiscussionState),
  getters: {
    productBacklog(): ISprintBoardColumn {
      return {
        key: 'product-backlog',
        name: 'Product Backlog',
        tasks: this.discussions
          .filter(d => (['goal', 'objective', 'story', 'task'] as PlanningItem['type'][])
            .includes(d.type as PlanningItem['type'])) as PlanningItem[]
      };
    },
  },
  actions: {
    async getUpdated(key: string) {
      return discussionResource.getData(key);
    },
    getTaskBoard(columns: IBoardColumn[], iterationKey: string) {
      const boardTasks = this.productBacklog.tasks.filter(t =>
      ((typeof t.iteration == 'object' && t.iteration.key == iterationKey)
        || (t.iteration == iterationKey)));
      return columns.map((c, index) => ({
        ...c,
        tasks: boardTasks.filter(t => (t.status == c.key || (index == 0 && !t.status)))
      })) as ISprintBoardColumn[];
    },
    fromIteration(projectKey: string, iterationKey: string) {
      return this.discussions.filter(d => d && d.projectKey == projectKey &&
        (d.iteration == iterationKey ||
          (d.iteration as (IIteration | undefined))?.key == iterationKey));
    },
    fromList(keys: string[], updatedList?: DiscussionItem[]) {
      if (updatedList) {
        return updatedList.filter(d => keys.includes(d.key));
      }
      //try from old records
      return this.discussions.filter(d => keys.includes(d.key));
    },
    ofProject(projectKey: string) {
      return discussionResource.streamWith({
        projectKey
      })
        .pipe(switchMap(list => {
          const profileStore = useProfilesStore();
          const iterationStore = useIterationStore();
          return from(Promise.all(list.map(async (m) => {
            if (m.type == 'scrum') {
              m.reporter = await profileStore.get(m.reporter as string) || m.reporter;
              m.todoTasks = this.fromList(m.todoTasks as string[], list);
              m.tasksDid = this.fromList(m.tasksDid as string[], list);
              m.roadblocks = this.fromList(m.roadblocks as string[], list);
              m.info = this.describeDiscussion(m);
            }
            if (Array.isArray(m.assignees) && typeof m.assignees[0] == 'string') {
              m.assignees = await profileStore.selectProjectMembers(m.assignees as string[]);
            }
            if (m.iteration && typeof m.iteration == 'string') {
              m.iteration = await iterationStore.getIteration(m.iteration);
            }
            return m;
          })));
        }))
        .subscribe({
          next: (stream) => {
            this.discussions = stream;
          },
        });
    },
    setActiveDiscussion(item?: DiscussionItem) {
      this.activeDiscussion = item;
    },
    async withKey(key: string) {
      if (key)
        return discussionResource.findOne({ key });
    },
    async saveDiscussion(discussion: DiscussionItem) {
      const copy = {
        ...discussion,
        iteration: typeof discussion.iteration == 'string'
          ? discussion.iteration
          : discussion.iteration?.key || ''
      } as DiscussionItem;
      await discussionResource.setData(copy.key, copy);
      const index = this.discussions.findIndex(i => i.key == copy.key);
      if (index < 0) {
        this.discussions.push(discussion);
      } else {
        discussion = Object.assign(this.discussions[index] || {}, { ...discussion });
        this.discussions.splice(index, 1, discussion);
      }
      await this.updateCeremonyProgress(discussion);
      return discussion;
    },
    async updateCeremonyProgress(discussion: DiscussionItem) {
      const ceremonyStore = useCeremonyStore();
      const targetCeremony = ceremonyStore.ceremonies.find(
        c => c.key == discussion.ceremonyKey && c.projectKey == discussion.projectKey);
      if (targetCeremony) {
        const items = this.discussions.filter(
          i => i.ceremonyKey == discussion.ceremonyKey && i.projectKey == discussion.projectKey);
        const progress = items.reduce((p, c) => p + (c.progress || 0), 0) /
          Math.max(items.length, 1);
        if (progress !== targetCeremony.progress) {
          targetCeremony.progress = progress;
          await ceremonyStore.saveCeremony(targetCeremony);
        }
      }
    },
    describeDiscussion(item?: DiscussionItem): string {
      switch (item?.type) {
        case 'goal':
          return 'Goal: ' + item.description;
        case 'objective':
          return 'Objective: ' + item.description;
        case 'story':
          return `As a ${item.targetUser}, I want to ${item.subject}, so that ${item.purpose}`;
        case 'task':
          return 'Task: ' + item.description;
        case 'action-item':
          return 'Action Item';
        case 'demo':
          return 'Demonstration';
        case 'went-well':
          return 'What went well?';
        case 'went-wrong':
          return 'What went wrong?';
        case 'to-improve':
          return 'What to improve?';
        case 'scrum':
          return 'Daily Task Report';
        case 'roadblock':
          return 'Roadblock';
        default:
          return (item && `${(item as DiscussionItem).type}`) || ('Unknown item');
      }
    },
    checkCompleteness(item: DiscussionItem, project: IProject, convo: ConvoList) {
      const factors: { factor: string, progress: number, feedback: string }[] = [];
      const members = project.members;
      const questions = convo.filter(c => c.type == 'question') as IQuestion[];
      const votes = convo.filter(c =>
        (c.type == 'vote')
        && members.includes(
          (typeof c.from == 'object') ? c.from.key : c.from)) as IVote[];

      const vCast = votes.reduce((p, c) =>
      (typeof c.vote == 'undefined' ? {} :
        { ...p, [typeof c.from == 'object' ? c.from.key : c.from]: c.vote }),
        {} as { [v: string]: string });

      const awareness = Object.values(item.awareness || {});
      const agreement = awareness.filter(agreeement => agreeement == 'agree');

      factors.push(this.completenessOfItem(item));
      const awarenessProgress = Object.keys(item.awareness || {})
        .filter(a => members.find(m => a == m)).length;
      factors.push(this.logFactor(awarenessProgress, members.length, 'awareness'));
      if (/(story|goal|objective|task)/.test(item.type)) {
        factors.push(this.logFactor(Object.values(vCast).length, members.length, 'votes'));
      }
      factors.push(this.logFactor(agreement.length, members.length, 'agreement'));

      const qProgress = questions.map((q) => {
        const totals = convo.reduce((p, c) => {
          if ((c.type == 'response' && c.ref == q.key)) {
            const casts = Object.values(c.feedback || {});
            return {
              agree: p.agree + casts.filter(v => (v == 'agree')).length,
              disagree: p.disagree + casts.filter(v => (v == 'disagree')).length
            };
          } else {
            return p;
          }
        }, { agree: 0, disagree: 0 })
        return {
          ...q,
          resolved: totals.agree > totals.disagree
        } as IQuestion
      }).reduce((p, q) => (
        q.resolved ?
          { ...p, resolved: p.resolved + 1 } :
          { ...p, pending: p.pending + 1 }),
        { resolved: 0, pending: 0 });

      factors.push(this.logFactor(qProgress.resolved, qProgress.resolved + qProgress.pending, 'questions resolution'));


      factors.splice(0, 0, this.logFactor(
        factors.reduce((p, c) => (p + c.progress), 0),
        factors.length, 'overall progress factors'))
      return factors;
    },
    logFactor(progress: number, over: number, msg: string) {
      const value = progress / Math.max(over, 1);
      if (value < 1 && (over > 0)) {
        return {
          progress: value,
          factor: msg,
          feedback: `Only ${(progress).toFixed(2)} of ${over} of ${msg} is complete`
        };
      } else {
        return {
          factor: msg,
          progress: 1, feedback: msg[0].toUpperCase() + msg.substring(1) + ' is complete'
        };
      }
    },
    completenessOfItem(item: DiscussionItem) {
      let progress = 0;
      const feedbacks = [] as string[];

      switch (item.type) {
        case 'goal': case 'task':
          return {
            factor: 'details',
            progress: item.description.length > 10 ? 1 : 0,
            feedback: item.description.length > 10 ? 'Details is set' : 'Descriptions is not well defined'
          };
        case 'objective':
          if (item.description.length > 10) {
            progress += 1;
            feedbacks.push('Details is set')
          } else {
            feedbacks.push('Descriptions is not well defined')
          }
          if (item.specifics && item.specifics.length > 10) {
            progress += 1;
            feedbacks.push('Specifics is set')
          } else {
            feedbacks.push('Specifics is not well defined')
          }
          if (item.mesures && item.mesures.length > 10) {
            progress += 1;
            feedbacks.push('Measures is set')
          } else {
            feedbacks.push('Measures is not well defined')
          }
          if (item.enables && item.enables.length > 10) {
            progress += 1;
            feedbacks.push('Enables is set')
          } else {
            feedbacks.push('Enables is not well defined')
          }
          if (item.due) {
            progress += 1;
            feedbacks.push('Due is set')
          } else {
            feedbacks.push('Due is not set')
          }
          return {
            factor: 'details',
            progress: progress / feedbacks.length,
            feedback: feedbacks.join('\n')
          };
        case 'story':
          if (item.targetUser) {
            progress += 1;
            feedbacks.push('Target user is defined')
          } else {
            feedbacks.push('Target user is not defined')
          }
          if (item.subject && item.subject.length > 10) {
            progress += 1;
            feedbacks.push('Subject is defined')
          } else {
            feedbacks.push('Subject is not well defined')
          }
          if (item.purpose && item.purpose.length > 10) {
            progress += 1;
            feedbacks.push('Purpose is defined')
          } else {
            feedbacks.push('Measures is not well defined')
          }
          if (item.acceptanceCriteria && item.acceptanceCriteria.length > 0) {
            progress += 1;
            feedbacks.push(item.acceptanceCriteria.length + ' Acceptance Criteria is set')
          } else {
            feedbacks.push('No Acceptance Criteria is defined')
          }
          return {
            factor: 'details',
            progress: progress / feedbacks.length,
            feedback: feedbacks.join('\n')
          };
        case 'scrum':
          if (item.reporter) {
            progress += 1;
            feedbacks.push('Reporter is defined')
          } else {
            feedbacks.push('Reporter is not defined')
          }
          const reported = item.todoTasks.length + item.tasksDid.length;
          if (reported > 0) {
            progress += 1;
            feedbacks.push(reported + ' tasks are reported')
          } else {
            feedbacks.push('No tasks reported')
          }
          return {
            factor: 'details',
            progress: progress / feedbacks.length,
            feedback: feedbacks.join('\n')
          };
        default:
          return {
            factor: 'details',
            progress: 0,
            feedback: 'unknown item type:' + item.type
          };
      }
    },
    async discussionsOf(ceremony: ICeremony) {
      const items = this.discussions.filter(d => d.iteration == ceremony.iterationKey);
      const project = useProjectStore().activeProject;
      if (ceremony.type == 'scrum' && project) {
        const noItems = project.members.filter(m => !(items.find(i => i.key.includes(m))));
        await Promise.all(noItems.map(async (m) => {
          return this.saveDiscussion({
            type: 'scrum',
            key: m + ceremony.key,
            awareness: {},
            ceremonyKey: ceremony.key,
            projectKey: ceremony.projectKey,
            reporter: m,
            roadblocks: [],
            tasksDid: [],
            todoTasks: []
          })
        }))
      } else if (ceremony.type == 'retro') {
        const base: IDiscussion = {
          key: ceremony.key,
          awareness: {},
          ceremonyKey: ceremony.key,
          projectKey: ceremony.projectKey,
        }
        const retoItems: RetroItem[] = [{
          type: 'went-well',
          ...base,
          key: 'wr' + ceremony.key,
          comments: []
        } as IWentWell, {
          type: 'went-wrong',
          ...base,
          key: 'ww' + ceremony.key,
          comments: []
        } as IWentWrong,
        {
          type: 'to-improve',
          ...base,
          key: 'ti' + ceremony.key,
          comments: []
        } as IToImprove,
        ].filter(i => !(items.find(d => d.type == i.type && d.ceremonyKey == i.ceremonyKey)));
        await Promise.all(retoItems.map((i) => {
          return this.saveDiscussion(i)
        }))

      }
    }
  }
});


