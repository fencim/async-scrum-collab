import { useDiscussionStore } from 'src/stores/discussions.store';
import { TheWorkflows } from '../the-workflows';


const discussionStore = useDiscussionStore();
TheWorkflows.on({
  type: 'deleteIssue',
  permissions: ['admin', 'moderator'],
  loggable: 'operation',
  async cb(e) {
    const { issue, done, error } = e;
    try {
      await discussionStore.deleteDiscussion(issue);
      done && done();
    } catch (err) {
      error && error(new Error(String(err)));
    }

  },
})
