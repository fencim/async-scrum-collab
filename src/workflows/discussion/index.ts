import { date, useQuasar } from 'quasar';
import { TheWorkflows } from '../the-workflows';
import { entityKey } from 'src/entities/base.entity';
import { IBoardColumn } from 'src/entities';
import { useActiveStore } from 'src/stores/active.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
const $q = useQuasar();
const boardColumns = (() => {
  const activeStore = useActiveStore();
  return activeStore.activeProject?.boardColumns || [];
});
function isColumnBeforeDone(column: IBoardColumn) {
  const cols = boardColumns();
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
      $q.notify({
        icon: 'error',
        message: 'Cannot move iteration goal of objective from other iteration',
        color: 'negative',
      });
      return;
    } else if (!!issue.doneDate && movingFromIteration) {
      $q.notify({
        icon: 'error',
        message: 'Cannot move done issue from other iteration',
        caption: 'Re-open it before moving it',
        color: 'negative',
      });
      return;
    } else if (column && iterationKey && issueReadyness && issue.progress && issue.progress < issueReadyness) {
      $q.notify({
        icon: 'error',
        message: 'Cannot grab issue until readyness reached ' + Number(issueReadyness * 10).toFixed(0) + '%',
        caption: 'Disscuss the issue with the team',
        color: 'negative',
      });
    }
    if (column) {
      issue.status = column.key;
      if (column.doneState) {
        issue.doneDate = date.formatDate(new Date(), 'YYYY/MM/DD');
      } else if (issue.doneDate && isColumnBeforeDone(column)) {
        //issue is reopened
        issue.doneDate = undefined;
      }
    }
    if (iterationKey) {
      issue.iteration = iterationKey;
    }
    const updated = await discussionStore.saveDiscussion(issue);
    e.done && e.done(updated);
  },
})

TheWorkflows.on({
  type: 'assignTask',
  async cb(e) {
    const discussionStore = useDiscussionStore();
    const updated = await discussionStore.assignTaskTo(e.issue, e.profile);
    e.done && e.done(updated);
  },
})
