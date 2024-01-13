import { useConvoStore } from 'src/stores/convo.store';
import { TheWorkflows } from '../the-workflows';
import { entityKey } from 'src/entities/base.entity';
import { useProfilesStore } from 'src/stores/profiles.store';
import { IQuestion } from 'src/entities';
import { useDiscussionStore } from 'src/stores/discussions.store';

TheWorkflows.on({
  type: 'confirmDisagreement',
  async cb(e) {
    const { item, message, done, error } = e;
    const convoStore = useConvoStore();
    const profileStore = useProfilesStore();
    const discussionStore = useDiscussionStore();
    if (item.iteration) {
      const question = await convoStore.sendMessage(
        item.projectKey,
        entityKey(item.iteration),
        item.key,
        profileStore.presentUser?.key || '',
        {
          type: 'question',
          message: 'I disagree because ' + message,
        }
      );
      if (profileStore.presentUser) {
        item.awareness = item.awareness || {};
        item.awareness[profileStore.presentUser.key] = 'disagree';
        await discussionStore.saveDiscussion(item);
        TheWorkflows.emit({
          type: 'assessDiscussion',
          arg: {
            item,
            done: () => {
              done && done(question as IQuestion);
            },
            error
          }
        })
      }
    } else if (error) {
      error('Item is not part of iteration');
    }
  },
})
