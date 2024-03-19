import { useDiscussionStore } from 'src/stores/discussions.store';
import { TheWorkflows } from '../the-workflows';

TheWorkflows.on({
  type: 'assignTask',
  permissions: ['admin', 'moderator', 'member'],
  loggable: 'operation',
  async cb(e) {
    const discussionStore = useDiscussionStore();
    try {
      const updated = await discussionStore.assignTaskTo(e.item, e.profile);
      if (updated) {
        e.done && e.done(updated);
        TheWorkflows.emit({
          type: 'assessDiscussion',
          arg: {
            item: updated
          }
        });
      } else {
        e.error && e.error(new Error('Failed to assign task'));
      }
    } catch (error) {
      e.error && e.error(new Error(String(error)));
    }
  },
})
