import { defineStore } from 'pinia';
import { date } from 'quasar';
import { Subscription, map, switchMap, Observable, from } from 'rxjs';
import { Convo, ConvoList } from 'src/entities';
import { convoResource } from 'src/resources';
import { useProfilesStore } from './profiles.store';
interface IConvoState {
  convo: ConvoList;
  currentSub?: Subscription;
  currentTopic: string;
}
export const useConvoStore = defineStore('convo', {
  state: () => ({
    convo: [],
    currentTopic: ''
  } as IConvoState),
  getters: {
  },
  actions: {
    ofDiscussion(projectKey: string, discussion: string) {
      const topic = `${projectKey}:${discussion}`;
      if (this.currentSub && !this.currentSub.closed && topic !== this.currentTopic) {
        this.currentSub.unsubscribe();
      } else if (this.currentSub && this.currentTopic == topic) return this.currentSub;

      const stream = convoResource.stream({
        projectKey, discussion
      }).pipe(switchMap(list => {
        const profileStore = useProfilesStore();
        list = list.sort((a, b) => ((new Date(a.date).getTime()) - (new Date(b.date).getTime())));
        return from(Promise.all(list.map(async (m) => {
          m.from = await profileStore.get(m.from as string) || m.from;
          return m;
        })))
      }));
      stream.subscribe({
        next: (convo) => {
          this.convo = [...convo];
        },
        error(err) {
          console.error(err);
        },
      })
      this.currentSub = stream.subscribe();
      return this.currentSub;
    },
    async sendMessage(projectKey: string, discussion: string, from: string, convo: Partial<Convo>) {
      if (!this.convo || !this.convo.length) {
        this.ofDiscussion(projectKey, discussion);
      }
      const msg = {
        ...convo,
        projectKey,
        discussion,
        date: date.formatDate(new Date()),
        from,
        key: (discussion || projectKey) + '-m' + String(this.convo.length),
      } as Convo;
      await convoResource.setData(msg.key, msg);
      //this.convo.push(msg);
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
    }
  },
});
