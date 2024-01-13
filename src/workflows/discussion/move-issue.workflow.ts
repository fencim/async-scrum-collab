import { date, useQuasar } from 'quasar';
import { TheWorkflows } from '../the-workflows';
import { entityKey } from 'src/entities/base.entity';
import { IBoardColumn } from 'src/entities';
import { useActiveStore } from 'src/stores/active.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
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
  async cb(e) {
    const discussionStore = useDiscussionStore();
    const activeStore = useActiveStore();
    const issueReadyness = activeStore.activeProject?.discussionReadiness || 0;
    const { issue, column, iterationKey } = e;
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
    } else if (column && iterationKey && issueReadyness && issue.progress && issue.progress < issueReadyness) {
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
    const updated = await discussionStore.saveDiscussion(issue);
    e.done && e.done(updated);
  },
})
