import { useDiscussionStore } from 'src/stores/discussions.store';
import { TheWorkflows } from '../the-workflows';
import { useConvoStore } from 'src/stores/convo.store';
import { useActiveStore } from 'src/stores/active.store';

TheWorkflows.on({
  type: 'assessDiscussion',
  async cb(e) {
    const discussionStore = useDiscussionStore();
    const convoStore = useConvoStore();
    const activeStore = useActiveStore();
    const project = activeStore.activeProject;
    const discussion = e.item;
    if (discussion && project) {
      convoStore.ofDiscussion()
      const report = discussionStore.checkCompleteness(
        discussion,
        project.members,
        this.convoStore.convo
      );
      if (this.discussion.progress != report[0].progress) {
        this.discussion.progress = report[0].progress;
        await discussionStore.saveDiscussion(this.discussion);
      }
      this.revealVotes = this.discussion.complexity;
      return report;
    }
  },
})
