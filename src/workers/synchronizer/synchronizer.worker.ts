import { logsResource } from 'src/resources/logs.resource';
import { SynchronizerEventNames, SynchronizerRequestEvent } from './message.event';
import './resource.registration';
import resourceSynchronizer from './resource.synchronizer';

const ctx: Worker = self as any;
function sendMessage(event: SynchronizerEventNames, data?: any) {
  ctx.postMessage({
    event: event,
    data: data,
  });
}

ctx.addEventListener('message', (event) => {
  try {
    const message = event.data as SynchronizerRequestEvent;
    let syncInfo: { module?: string; entity?: string };
    switch (message.event) {
      case 'retrySynching':
        const retryInfo = message.data as { module?: string; entity?: string };
        resourceSynchronizer.resumeSyncing([
          'createError',
          'patchError',
          'deleteError',
          'updateError',
          'saved',
          'patched',
          'updated',
          'deleted',
        ], retryInfo?.module, retryInfo?.entity);
        break;
      case 'syncUpStream':
        syncInfo = message.data;
        resourceSynchronizer.resumeSyncing([
          'saved',
          'patched',
          'updated',
          'deleted',
        ], syncInfo?.module, syncInfo?.entity);
        break;
      case 'syncResource':
        syncInfo = message.data;
        resourceSynchronizer.syncResources(
          (info) => {
            if (info.type == 'summary') {
              sendMessage('syncStatus', info.details);
            } else if (info.type == 'statusChanged') {
              sendMessage('docStatusChanged', info.details);
            } else if (info.type == 'log') {
              sendMessage('log', info.details);
            }
          },
          syncInfo?.module,
          syncInfo?.entity
        );
        break;
      case 'clearAll':
        resourceSynchronizer.clearAllRecords();
        break;
      case 'stopSynching':
        resourceSynchronizer.stopSyncing(
          typeof message.data == 'number' ? message.data : undefined);
        break;
      case 'resumeSynching':
        resourceSynchronizer.resumeSyncing(
          undefined,
          message.data?.module,
          message.data?.entity
        );
        break;
      case 'setUserKey':
        logsResource.userKey = message.data as string;
        break;
      default:
        break;
    }
  } catch { }
});
