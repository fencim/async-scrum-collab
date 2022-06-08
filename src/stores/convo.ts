import { defineStore } from 'pinia';
import { date } from 'quasar';
import { Convo } from 'src/entities';
import { convoService } from 'src/services';

export const useConvoStore = defineStore('convo', {
  state: () => ({
    convo: [] as Convo[],
  }),
  getters: {
  },
  actions: {
    async init() {
      this.convo = await convoService.findAllFrom();
    },
    async ofDiscussion(projectKey: string, discussion: string) {
      this.convo = (await convoService.findAllDocFrom({
        projectKey, discussion
      })).filter(d => d).map(d => ({
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
      await convoService.setData(msg.key, msg);
      this.convo.push(msg);
    },
    async saveConvo(msg: Convo) {
      if (msg && msg.key) {
        await convoService.setData(msg.key, {
          ...msg,
          from: typeof msg.from == 'object' ? msg.from.key : msg.from
        });
      }
    },
    async getConvoStatus(key: string) {
      return convoService.getDocStatus(key);
    },
    getConvo(key: string) {
      return this.convo.find(c => c.key == key);
    }
  },
});
