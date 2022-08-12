import { defineStore } from 'pinia';
import { Convo, DiscussionItem, IProject, IQuestion, IVote } from 'src/entities';
import { discussionResource } from 'src/resources/discussions.resource';

export const useDiscussionStore = defineStore('discussion', {
  state: () => ({
    discussions: [] as DiscussionItem[]
  }),
  getters: {

  },
  actions: {
    async init() {
      this.discussions = await discussionResource.findAllFrom();
    },
    async fromKeyList(projectKey: string, list: string[]): Promise<DiscussionItem[]> {
      const discussions = (await this.ofProject(projectKey));
      const discussionList = list.map(key => discussions.find(d => d.key == key))
        .filter(d => d) as DiscussionItem[];
      return discussionList;
    },
    async ofProject(projectKey: string) {
      this.discussions = await discussionResource.findAllFrom({
        projectKey
      });
      return this.discussions;
    },
    async withKey(key: string) {
      return discussionResource.findOne({ key });
    },
    async saveDiscussion(discussion: DiscussionItem) {
      if (discussion.type == 'story') {
        discussion.acceptanceCriteria = [...(discussion.acceptanceCriteria || [])].map(ac => ({ ...ac }));
        discussion.tasks = [...(discussion.tasks || [])];
      }
      await discussionResource.setData(discussion.key, {
        ...discussion
      });
      const index = this.discussions.findIndex(i => i.key == discussion.key);
      if (index < 0) {
        this.discussions.push(discussion);
      } else {
        this.discussions.splice(index, 1, discussion);
      }
      return discussion;
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
    checkCompleteness(item: DiscussionItem, project: IProject, convo: Convo[]) {
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
        default:
          return {
            factor: 'details',
            progress: 0,
            feedback: 'unknown item type:' + item.type
          };
      }
    }
  }
});
