import { date } from 'quasar';
import { TheWorkflows } from '../the-workflows';
import { entityKey } from 'src/entities/base.entity';
import { DiscussionItem, IBoardColumn } from 'src/entities';
import { useActiveStore } from 'src/stores/active.store';
import { TaskActionError } from './definition';

function isColumnBeforeDone(column: IBoardColumn) {
  const activeStore = useActiveStore();
  const cols = activeStore.activeProject?.boardColumns || [];
  const indexOfCol = cols.findIndex((c) => c.key == column.key);
  const indexOfDoneCol = cols.findIndex((c) => c.doneState);
  return indexOfCol >= 0 && indexOfDoneCol > 0 && indexOfCol < indexOfDoneCol;
}

TheWorkflows.on({
  type: 'moveIssue',
  permissions: ['admin', 'moderator', 'member'],
  loggable: 'operation',
  async cb(e) {
    const activeStore = useActiveStore();
    const issueReadiness = activeStore.activeProject?.discussionReadiness || 0;
    const { item: issue, column, iterationKey } = e;
    const goIssues = issue.type == 'goal' || issue.type == 'objective';
    const movingFromIteration =
      iterationKey &&
      issue.iteration &&
      iterationKey !== entityKey(issue.iteration);
    if (goIssues && movingFromIteration) {
      e.error && e.error(TaskActionError.notMoveable);
      return;
    } else if (!!issue.doneDate && movingFromIteration) {
      e.error && e.error(TaskActionError.alreadyClosed);
      return;
    } else if (column && iterationKey && issueReadiness && issue.progress && issue.progress < issueReadiness) {
      e.error && e.error(TaskActionError.notReady);
      return;
    }
    if (column) {
      issue.status = column.key;
      if (column.doneState) {
        issue.doneDate = date.formatDate(new Date(), 'YYYY/MM/DD');
      } else if (issue.doneDate && isColumnBeforeDone(column)) {
        //issue is reopened
        issue.doneDate = '';
      }
    }
    if (iterationKey) {
      issue.iteration = iterationKey;
    }
    const updated = await TheWorkflows.emitPromised<DiscussionItem>({
      type: 'updateDiscussionFields',
      arg: {
        item: issue
      }
    });
    e.done && e.done(updated);
  },
})
