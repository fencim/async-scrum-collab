import { useDiscussionStore } from 'src/stores/discussions.store';
import { TheWorkflows } from '../the-workflows';

TheWorkflows.on({
  type: 'assignTask',
  async cb(e) {
    const discussionStore = useDiscussionStore();
    const updated = await discussionStore.assignTaskTo(e.issue, e.profile);
    TheWorkflows.emit({
      type: 'assessDiscussion',
      arg: {
        item: updated,
        done() {
          e.done && e.done(updated);
        },
      }
    });
  },
})
