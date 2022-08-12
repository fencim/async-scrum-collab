import { defineStore } from 'pinia';
import { date } from 'quasar';
import { Convo } from 'src/entities';
import { convoResource } from 'src/resources';

export const useConvoStore = defineStore('convo', {
  state: () => ({
    convo: [] as Convo[],
  }),
  getters: {
  },
  actions: {
    async init() {
      this.convo = await convoResource.findAllFrom();
    },
    async ofDiscussion(projectKey: string, discussion: string) {
      const docs = (await convoResource.findAllDocFrom({
        projectKey, discussion
      }));
      this.convo = docs.filter(d => d).map(d => ({
        ...d.data,
        status: d.status
      } as Convo)).sort((a, b) => ((new Date(a.date).getTime()) - (new Date(b.date).getTime())));
      return this.convo;
    },
    async sendMessage(projectKey: string, discussion: string, from: string, convo: Partial<Convo>) {
      if (!this.convo || !this.convo.length) {
        this.convo = await this.ofDiscussion(projectKey, discussion);
      }
      const messages = this.convo.filter(c => c.projectKey == projectKey && c.discussion == discussion);
      const msg = {
        ...convo,
        projectKey,
        discussion,
        date: date.formatDate(new Date()),
        from,
        key: (discussion || projectKey) + '-m' + String(messages.length),
      } as Convo;
      await convoResource.setData(msg.key, msg);
      this.convo.push(msg);
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
