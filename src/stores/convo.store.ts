import { defineStore } from 'pinia';
import { date } from 'quasar';
import { Subscription, switchMap, from, Observable } from 'rxjs';
import { Convo, ConvoList } from 'src/entities';
import { ActionItem, ticketActionList } from 'src/modules/ceremony/ceremony.action-list';
import { convoResource } from 'src/resources';
import { useDiscussionStore } from './discussions.store';
import { useProfilesStore } from './profiles.store';
import { useProjectStore } from './projects.store';

interface IConvoState {
  convo: ConvoList;
  currentSub?: Subscription;
  currentTopic: string;
  streams: { [topic: string]: Observable<ConvoList> }
  actions: ActionItem[];
  activeAction?: ActionItem;
}
export const useConvoStore = defineStore('convo', {
  state: () => ({
    convo: [],
    currentTopic: '',
    streams: {},
    actions: ticketActionList
  } as IConvoState),
  getters: {
  },
  actions: {
    ofDiscussion(projectKey: string, discussion: string) {
      const topic = `${projectKey}:${discussion}`;
      this.convo = [];
      const stream = this.streams[topic] || (convoResource.streamWith({
        projectKey, discussion
      }).pipe(switchMap(list => {
        const profileStore = useProfilesStore();
        list = list.sort((a, b) => ((new Date(a.date).getTime()) - (new Date(b.date).getTime())));
        return from(Promise.all(list.map(async (m) => {
          m.from = await profileStore.get(m.from as string) || m.from;
          return m;
        })));
      })));
      this.streams[topic] = stream;
      stream.subscribe({
        next: (convo) => {
          this.convo = [...convo];
          this.computeCompleteness(projectKey, discussion, convo);
        },
        error(err) {
          console.error(err);
        },
      })
      this.currentSub = stream.subscribe();
      return stream;
    },
    async sendMessage(projectKey: string, discussion: string, from: string, convo: Partial<Convo>) {
      const msg = {
        ...convo,
        projectKey,
        discussion,
        date: date.formatDate(new Date()),
        from,
      } as Convo;
      msg.key = convoResource.getKeyOf({
        ...msg,
        toString: () => `${projectKey}: ${discussion} : ${msg.date}`
      } as Convo);
      await convoResource.setData(msg.key, msg);
    },
    async saveConvo(msg: Convo) {
      if (msg && msg.key) {
        await convoResource.setData(msg.key, {
          ...msg,
          from: typeof msg.from == 'object' ? msg.from.key : msg.from
        });
      }
    },
    async getConvoStatus(key: string) {
      return convoResource.getDocStatus(key);
    },
    getConvo(key: string) {
      return this.convo.find(c => c.key == key);
    },
    async computeCompleteness(projectKey: string, discussion: string, convo: ConvoList) {
      const projectStore = useProjectStore();
      const discussionStore = useDiscussionStore();
      const project = projectStore.projects.find(p => p.key == projectKey);
      const discItem = discussionStore.discussions.find(d => d.key == discussion && d.projectKey == projectKey);
      const presentUser = useProfilesStore().presentUser;
      if (discItem && project && presentUser) {
        const report = discussionStore.checkCompleteness(discItem, project, convo);
        if (report[0].progress != discItem.progress) {
          discItem.progress = report[0].progress;
          await discussionStore.saveDiscussion(discItem);
        }
        //actions states
        const list = report.reduce((p, r) => {
          if (r.factor == 'details' && r.progress < 1) {
            p.push('view');
          } else if (r.factor == 'votes' && r.progress < 1) {
            p.push('agree');
          } else if (r.factor == 'agreement' && discItem.awareness && discItem.awareness[presentUser.key] != 'agree'
          ) {
            p.push('agree');
          }
          return p;
        }, [] as string[]);
        this.actions.forEach((link) => {
          if (list.includes(link.key)) {
            link.emphasize =
              !(link.active || this.activeAction == link) && !link.emphasize;
          }
        });
      }
    },
    setLinkVisibility(key: string | RegExp, visibility: boolean) {
      this.actions.forEach((l) => {
        if (key && new RegExp(key).test(l.key)) {
          l.hide = !visibility;
        }
      });
    },
    activateLink(key: string, active?: boolean) {
      const link = this.actions.find((l) => l.key == key);
      if (link) {
        if (typeof active == 'boolean') {
          link.active = active;
        } else {
          this.activeAction = link;
        }
      }
    },
  },
});


