import { useConvoStore } from 'src/stores/convo.store';
import { TheWorkflows } from '../the-workflows';
import { entityKey } from 'src/entities/base.entity';
import { useProfilesStore } from 'src/stores/profiles.store';
import { IQuestion } from 'src/entities';

TheWorkflows.on({
  type: 'askQuestion',
  permissions: ['admin', 'moderator', 'member', 'guest'],
  loggable: 'operation',
  async cb(e) {
    const { item, message, done, error } = e;
    const convoStore = useConvoStore();
    const profileStore = useProfilesStore();
    if (item.iteration) {
      const question = await convoStore.sendMessage(
        item.projectKey,
        entityKey(item.iteration),
        item.key,
        profileStore.presentUser?.key || '',
        {
          type: 'question',
          message: message,
        }
      );
      done && done(question as IQuestion);
    } else if (error) {
      error('Item is not part of iteration');
    }
  },
})
