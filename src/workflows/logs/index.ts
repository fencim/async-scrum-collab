import { date } from 'quasar';
import { ILoggable } from 'src/entities';
import { useTransactionLogsStore } from 'src/stores/transaction-log-store';
import { useEmitStore } from 'src/stores/emit.store';
import { TheWorkflows } from '../the-workflows';
import { convoBus } from 'src/modules/ceremony/convo-bus';
import { useProfilesStore } from 'src/stores/profiles.store';
import { useActiveStore } from 'src/stores/active.store';

const logger = useTransactionLogsStore();
TheWorkflows.on({
  type: 'logTransaction',
  async cb(e) {
    if (e.log.kind == 'console' && process.env.NODE_ENV !== 'production') {
      console.log('Console Log: >>>>>>> ', e.log);
    } else if (e.log.kind != 'console') {
      try {
        const log = await logger.saveTransaction(e.log);
        if (log && process.env.NODE_ENV !== 'production') {
          console.log('Log Saved: >>>>>>> ', log.key);
        }
      } catch (error) {
        console.error(error);
      }
    }
  },
})

function cleanUpArgument(
  obj: Record<string, unknown>
): Record<string, unknown> {
  // Use Object.entries to get an array of [key, value] pairs
  const filteredEntries = Object.entries(obj)
    // Use Array.prototype.filter to exclude entries with undefined, null, or function values
    .filter(([key, value]) => key != 'password' && value !== undefined && value !== null && typeof value !== 'function');
  // Use Object.fromEntries to convert the filtered array back to an object
  const result = Object.fromEntries(filteredEntries);
  return JSON.parse(JSON.stringify(result));
}
const theBus = convoBus;
theBus.on('*', async (type: unknown, event: unknown) => {
  const emitStore = useEmitStore();
  const desc = {
    type: type as string,
    arg: event
  };
  if (!/^(logTransaction)$/.test(desc.type)) {
    const profileStore = useProfilesStore();
    const activeStore = useActiveStore();
    const user = await profileStore.getUserAsync();
    const kind = emitStore.loggables[desc.type];
    if (kind !== 'post-operation') {
      theBus.emit('logTransaction', {
        log: {
          type: desc.type,
          date: date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss.SSS'),
          kind: kind || 'console',
          project: activeStore.activeProject?.key || '',
          operator: user?.key,
          data: desc.arg && cleanUpArgument(desc.arg as Record<string, unknown>) || {}
        } as ILoggable
      });
    } else if (desc.arg && typeof desc.arg == 'object' && typeof (desc.arg as { done?: VoidCallback }).done == 'function') {
      const arg = (desc.arg as { done?: (param: unknown) => void });
      const oldCb = arg.done;
      arg.done = (async (param) => {
        const user = await profileStore.getUserAsync();
        theBus.emit('logTransaction', {
          log: {
            type: desc.type,
            date: date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss.SSS'),
            kind: kind || 'console',
            project: activeStore.activeProject?.key || '',
            operator: user?.key,
            data: param ?
              cleanUpArgument(param as Record<string, unknown>) :
              desc.arg && cleanUpArgument(desc.arg as Record<string, unknown>) || {}
          } as ILoggable
        });

        oldCb && oldCb(param);
      })
    }
  }
})
