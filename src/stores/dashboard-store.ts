import { defineStore } from 'pinia';
import { date } from 'quasar';
import { ILogCounter } from 'src/entities';
import { logCounterResource } from 'src/resources/log-counter.resource';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    counters: {} as Record<string, ILogCounter>,
  }),
  getters: {},
  actions: {
    async countTransaction(type: string, from: string, extra?: Record<string, string>) {
      const filter = {
        ...(extra || {}),
        type,
        'date >=': from
      };
      const counter = await logCounterResource.getCountOf(filter, date.getDateDiff(new Date(), from, 'days') !== 0);
      if (counter) {
        this.counters[counter.key] = counter;
      }
      return counter;
    }
  },
});
