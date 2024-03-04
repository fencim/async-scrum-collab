import { defineStore } from 'pinia';
import { date } from 'quasar';
import { Subscription, Observable } from 'rxjs';
import { Convo, ConvoList } from 'src/entities';
import { ActionItem, ticketActionList } from 'src/modules/ceremony/ceremony.action-list';
import { convoResource } from 'src/resources';
import { useDiscussionStore } from './discussions.store';
import { useProfilesStore } from './profiles.store';
import { useProjectStore } from './projects.store';
import { DeferredPromise } from 'src/resources/localbase';

interface IConvoState {
  convo: Record<string, ConvoList>;
  subs: Record<string, Subscription>;
  streams: { [topic: string]: Observable<ConvoList> }
  actions: ActionItem[];
  activeAction?: ActionItem;
  latestConvo?: Convo;
}
export const useConvoStore = defineStore('convo', {
  state: () => ({
    convo: {},
    subs: {},
    streams: {},
    actions: ticketActionList
  } as IConvoState),
  getters: {
  },
  actions: {
    ofIteration(iteration: string) {
      const topic = `iteration:${iteration}`;
      if (this.streams[topic]) return this.streams[topic];
      this.convo[iteration] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const stream = convoResource.streamWith({
        iteration,
      });
      this.streams[topic] = stream;
      stream.subscribe({
        next: async (convo) => {
          if (!convo) return;
          const profileStore = useProfilesStore();
          const list = [...convo].sort((a, b) => ((new Date(a.date).getTime()) - (new Date(b.date).getTime())));
          const mapped = await (Promise.all(list.map(async (m) => {
            m.from = await profileStore.get(m.from as string) || m.from;
            return m;
          })));
          this.convo[iteration] = mapped;
        }
      })
      this.subs[iteration] = stream.subscribe();
      return stream;
    },
    async ofDiscussion(iteration: string, discussion: string) {
      if (this.convo[iteration]) {
        return this.convo[iteration].filter(convo => convo.discussion == discussion);
      }
      const deffered = new DeferredPromise<ConvoList>();
      this.ofIteration(iteration).subscribe({
        next(list) {
          deffered.resolve(list.filter(convo => convo.discussion == discussion))
        },
        error: deffered.reject
      })
      return deffered.promise;
    },
    async sendMessage(projectKey: string, iteration: string, discussion: string, from: string, convo: Partial<Convo>) {
      const msg = {
        ...convo,
        projectKey,
        iteration,
        discussion,
        date: date.formatDate(new Date()),
        from,
      } as Convo;

      const record = await convoResource.setData('', msg, true);
      if (record && this.convo[iteration]) {
        this.convo[iteration].push(record)
      }
      return msg;
    },
    async updateMessage<C extends Convo>(key: string,
      prop: keyof C, value: C[keyof C]) {
      const convo = await convoResource.getData(key);
      if (!convo) {
        throw 'Convo does not exits';
      }
      const deffered = new DeferredPromise<Convo | undefined>();
      await convoResource.updateProperty(key, prop as keyof Convo, value, async (info) => {
        if (info.status == 'synced') {
          const updated = await convoResource.getLocalData(info.newKey || info.key || key);
          deffered.resolve(updated);
        } else if (/error/i.test(info.status)) {
          const doc = await convoResource.getDoc(info.newKey || info.key || key);
          deffered.reject(doc?.remarks || 'Failed to update convo');
        }
      });
      return deffered.promise;
    },

    async getConvoStatus(key: string) {
      return convoResource.getDocStatus(key);
    },
    getConvo(key: string, iterationKey: string) {
      return this.convo[iterationKey].find(c => c.key == key) as Convo;
    },
    async computeCompleteness(discussion: string, convo: ConvoList) {
      const projectStore = useProjectStore();
      const discussionStore = useDiscussionStore();
      const discItem = discussionStore.discussions.find(d => d.key == discussion);
      const project = projectStore.projects.find(p => p.key == discItem?.projectKey);
      const presentUser = useProfilesStore().presentUser;
      if (discItem && project && presentUser) {
        const report = discussionStore.checkCompleteness(discItem, project.members, convo);
        if (report[0].progress != discItem.progress) {
          discItem.progress = report[0].progress;
          await discussionStore.updateDiscussion(discItem.key, ['progress'], discItem);
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


