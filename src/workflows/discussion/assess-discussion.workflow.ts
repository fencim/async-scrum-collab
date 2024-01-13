import { useDiscussionStore } from 'src/stores/discussions.store';
import { TheWorkflows } from '../the-workflows';
import { useConvoStore } from 'src/stores/convo.store';
import { useActiveStore } from 'src/stores/active.store';
import { entityKey } from 'src/entities/base.entity';

TheWorkflows.on({
  type: 'assessDiscussion',
  async cb(e) {
    const discussionStore = useDiscussionStore();
    const convoStore = useConvoStore();
    const activeStore = useActiveStore();
    const project = activeStore.activeProject;
    const discussion = e.item;
    if (discussion.iteration && project) {
      try {
        const convo = await convoStore.ofDiscussion(entityKey(discussion.iteration), discussion.key);
        if (discussion.convoCount && convo.length < discussion.convoCount) {
          e.done && e.done();
          return;
        }
        const report = discussionStore.checkCompleteness(
          discussion,
          project.members,
          convo
        );
        if (discussion.progress != report[0].progress) {
          discussion.progress = report[0].progress;
          await discussionStore.saveDiscussion(discussion);
        }
        e.done && e.done(report);
      } catch (error) {
        e.error && e.error(error);
      }
    } else if (e.error) {
      e.error('Dicusssion is not part of an iteration');
    }
  },
})
