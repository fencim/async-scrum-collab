import { defineStore } from 'pinia';
import { from, switchMap } from 'rxjs';
import {
  ConvoList,
  DiscussionItem,
  ICeremony,
  IQuestion, ISprintBoardColumn, IVote,
  PlanningItem, IProfile,
  IBoardColumn, DiscussionReport, IRoadBlock, IScrumReport, IReaction
} from 'src/entities';
import { discussionResource } from 'src/resources/discussions.resource';
import { useCeremonyStore } from './ceremonies.store';
import { useProfilesStore } from './profiles.store';
import { useProjectStore } from './projects.store';
import { useIterationStore } from './iterations.store';
import { entityKey } from 'src/entities/base.entity';
import { PlanningTypes } from '../entities';
import { DeferredPromise } from 'src/resources/localbase';
import { useActiveStore } from './active.store';

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
      const project = useActiveStore().activeProject;
      return {
        key: 'product-backlog',
        name: 'Product Backlog',
        tasks: this.discussions
          .filter(d => d.projectKey == project?.key && (['story', 'task', 'roadblock'] as string[]).includes(d.type)) as PlanningItem[]
      };
    },
  },
  actions: {
    async getUpdated(key: string) {
      return discussionResource.getData(key);
    },
    getTaskBoard(columns: IBoardColumn[], iterationKey: string) {
      const boardTasks = this.productBacklog.tasks.filter(t =>
        (entityKey(t.iteration || '') == iterationKey));
      return columns.map((c) => ({
        ...c,
        tasks: boardTasks.filter(t => (t.status == c.key /*|| (index == 0 && !t.status)*/))
      })) as ISprintBoardColumn[];
    },
    fromIteration(projectKey: string, iterationKey: string) {
      return this.discussions.filter(d => d && d.projectKey == projectKey &&
        (entityKey(d.iteration || '') == iterationKey));
    },
    fromList(keys: string[], updatedList?: DiscussionItem[]) {
      if (updatedList) {
        return updatedList.filter(d => keys.includes(d.key));
      }
      //try from old records
      return this.discussions.filter(d => keys.includes(d.key));
    },
    ofProject(projectKey: string) {
      if (!this.discussions.find(c => c.projectKey == projectKey)) {
        this.discussions = [];
      }
      return discussionResource.streamWith({
        projectKey
      })
        .pipe(switchMap(list => {
          if (!list) return [];
          const profileStore = useProfilesStore();
          const iterationStore = useIterationStore();
          return from(Promise.all(list.map(async (m) => {
            if (m.type == 'scrum') {
              m.todoTasks = this.fromList(m.todoTasks as string[], list);
              m.tasksDid = this.fromList(m.tasksDid as string[], list);
              m.roadblocks = this.fromList(m.roadblocks as string[], list) as IRoadBlock[];
              m.info = this.describeDiscussion(m);
            }
            if (Array.isArray(m.assignees) && typeof m.assignees[0] == 'string') {
              m.assignees = await profileStore.selectProjectMembers(m.assignees as string[]);
              m.assignedTo = (m.assignees as IProfile[]).find(a => a.key == m.assignedTo) || m.assignedTo;
            }

            if (m.iteration && typeof m.iteration == 'string') {
              m.iteration = await iterationStore.getIteration(m.iteration);
            }
            return m;
          })));
        }))
        .subscribe({
          next: (stream) => {
            this.discussions = stream || [];
          },
        });
    },
    async updateDiscussion<T extends keyof DiscussionItem>(
      key: string,
      props: T[],
      source: Partial<DiscussionItem>
    ) {
      const deferred = new DeferredPromise<DiscussionItem | undefined>();
      discussionResource.updatePropertiesFrom(key, source, props, async (update) => {
        if (update.status == 'synced') {
          deferred.resolve(await discussionResource.getLocalData(update.newKey || update.key || ''));
        } else if (/error/i.test(update.status)) {
          const doc = await discussionResource.getDoc(update.newKey || update.key || '');
          deferred.reject(doc?.remarks || 'Failed to update Discussion');
        }
      });
      return deferred.promise;
    },
    setActiveDiscussion(item?: DiscussionItem) {
      this.activeDiscussion = item;
    },
    openAssignedTo(profileKey: string) {
      return this.discussions.filter(d => !d.doneDate && d.assignees?.find(a => entityKey(a) == profileKey))
    },
    async withKey(key: string) {
      if (key) {
        return this.discussions.find(d => d.key == key) ?? discussionResource.findOne({ key });
      }
    },
    async assignTaskTo(task: DiscussionItem, profile: IProfile) {
      const updated = (await this.getUpdated(task.key)) || task;
      updated.assignees = updated.assignees?.map(a => typeof a == 'object' ? a.key : a) || [];
      const existingIndex = updated.assignees.findIndex(a => a == profile.key);
      if (existingIndex < 0) {
        updated.assignees.push(profile.key);
      } else {
        updated.assignees.splice(existingIndex, 1);
        updated.assignees.splice(0, 0, profile.key);
      }
      updated.assignedTo = profile.key;
      return await this.updateDiscussion(task.key, ['assignedTo', 'assignees'], updated);
    },
    async saveDiscussion(discussion: DiscussionItem) {
      const copy = (({
        ...discussion,
        iteration: discussion.iteration && entityKey(discussion.iteration) || discussion.iteration,
        assignedTo: discussion.assignedTo && entityKey(discussion.assignedTo) || discussion.assignedTo,
        ceremonyKey: discussion.ceremonyKey || '',
        assignees: (discussion.assignees || []).map(a => typeof a == 'object' ? a.key : a)
      })) as DiscussionItem;
      await discussionResource.setData(copy.key, copy);
      const index = this.discussions.findIndex(i => i.key == copy.key);
      if (index < 0) {
        this.discussions.push(discussion);
      } else {
        discussion = { ...(this.discussions[index] || {}), ...discussion };
        this.discussions.splice(index, 1, discussion);
      }
      await this.updateCeremonyProgress(discussion);
      return discussion;
    },
    async updateCeremonyProgress(discussion: DiscussionItem) {
      const ceremonyStore = useCeremonyStore();
      const iterationKey = typeof discussion.iteration == 'object' ?
        discussion.iteration?.key : discussion.iteration;
      const targetCeremony = ceremonyStore.ceremonies.find(
        c => c.iterationKey == iterationKey && c.projectKey == discussion.projectKey);
      if (targetCeremony) {
        const items = this.discussionsOf(targetCeremony);
        const progress = items.reduce((p, c) => p + (c.progress || 0), 0) /
          Math.max(items.length, 1);
        if (progress !== targetCeremony.progress && targetCeremony.type == 'planning') {
          targetCeremony.progress = progress;
          await ceremonyStore.patchCeremony(targetCeremony.key, ['progress'], targetCeremony);
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
          return item.description ||
            (item.targetUser && `As a ${item.targetUser}, I want to ${item.subject ?? ''
              }, so that ${item.purpose ?? ''}`) ||
            'Story';
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
          return item.description;
        default:
          return (item && `${(item as DiscussionItem).type}`) || ('Unknown item');
      }
    },
    checkCompleteness(item: DiscussionItem, members: string[], convo: ConvoList) {
      const factors: DiscussionReport[] = [];
      const questions = convo.filter(c => c.type == 'question') as IQuestion[];
      const votes = convo.filter(c =>
        (c.type == 'vote')
        && members.includes(entityKey(c.from || ''))) as IVote[];
      const reactions = convo.filter(c =>
        (c.type == 'reaction')
        && members.includes(entityKey(c.from || ''))) as IReaction[];
      const lastIndex = votes.findLastIndex((v) => v.vote == '0');
      if (lastIndex >= 0) {
        votes.splice(0, lastIndex + 1);
      }
      const vCast = votes.reduce((p, c) =>
      (typeof c.vote == 'undefined' ? {} :
        { ...p, [entityKey(c.from)]: c.vote }),
        {} as { [v: string]: string });

      const agreement = [...new Set(reactions.filter(r => r.reaction == 'agree').map(m => entityKey(m.from)))];

      factors.push(this.completenessOfItem(item));
      const awarenessProgress = [...new Set(reactions.map(m => entityKey(m.from)))].length;
      factors.push(this.logFactor(awarenessProgress, members.length, 'awareness'));
      if (PlanningTypes.includes(item.type as PlanningItem['type'])) {
        factors.push(this.logFactor(Object.values(vCast).length, members.length, 'votes'));
        factors.push(this.logFactor(agreement.length, members.length, 'agreement'));
      }

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
          feedback: `Only ${Math.round(progress * 100) / 100} of ${over} of ${msg} is complete`
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
      if (PlanningTypes.includes(item.type as PlanningItem['type'])) {
        if (!item.dueDate) {
          feedbacks.push('Estimated Due Date is not set');
        } else {
          progress += 1;
          feedbacks.push('Estimated Due Date is set')
        }
      }
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
          if (item.measures && item.measures.length > 10) {
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
          if (item.assignedTo) {
            progress += 1;
            feedbacks.push('Reporter/Assignee is defined')
          } else {
            feedbacks.push('Reporter/Assignee is not defined')
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
        case 'roadblock':
          if (item.assignedTo) {
            progress += 1;
            feedbacks.push('Responsible by is defined')
          } else {
            feedbacks.push('Responsible by is not defined')
          }
          if (item.description) {
            progress += 1;
            feedbacks.push('Roadblock is defined')
          } else {
            feedbacks.push('Roadblock is not well defined')
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
    discussionsOf(ceremony: ICeremony): DiscussionItem[] {
      const items = this.discussions.filter(d => d.iteration && entityKey(d.iteration) == ceremony.iterationKey);
      const project = useProjectStore().activeProject;
      if (ceremony.type == 'planning') {
        return items.filter(i => PlanningTypes.includes(i.type as PlanningItem['type']));
      } else if (ceremony.type == 'scrum' && project) {
        const reports = items.filter(i => i.type == 'scrum' && i.ceremonyKey == ceremony.key);
        const roadblocks = items.filter(i => i.type == 'roadblock') as IRoadBlock[];
        const mentionedRoadblocks = reports.reduce((prev, cur) => {
          return [...(new Set(...prev, (cur as IScrumReport).roadblocks?.map(r => entityKey(r))))];
        }, [] as string[]);
        reports.push(...roadblocks.filter(r => mentionedRoadblocks.includes(r.key)));
        return reports;
      }
      return items.filter(d => d.ceremonyKey == ceremony.key);
    }
  }
});


