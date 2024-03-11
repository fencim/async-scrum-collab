import { defineStore } from 'pinia';
import { date } from 'quasar';
import { ILoggable } from 'src/entities';
import { logResource } from 'src/resources/log.resource';

export const useTransactionLogsStore = defineStore('transactionLogs', {
  state: () =>
    ({
      logs: []
    }) as { logs: ILoggable[] },
  getters: {},
  actions: {
    async saveTransaction(log: ILoggable) {
      this.logs.push(log);
      return logResource.setData('', log);
    },
    findTransactions(filter: Record<string, string | string[] | undefined>) {
      return logResource.findAllFrom(filter);
    },
    async findTransactionsOn(targetDate: string) {
      const from = date.formatDate(targetDate, 'YYYY-MM-DD 00:00');
      const until = date.formatDate(targetDate, 'YYYY-MM-DD 23:59');
      const filter = {
        'date >=': from,
        'date <=': until
      };
      return (await logResource.findAllFrom(filter));
    },
    streamTransactionsOn(project: string, startDate: string, endDate: string) {
      const from = date.formatDate(startDate, 'YYYY-MM-DD 00:00');
      const until = date.formatDate(endDate, 'YYYY-MM-DD 23:59');
      const filter = {
        'date >=': from,
        'date <=': until,
        project
      };
      return (logResource.streamWith(filter));
    }
  }
});
