import { useConvoStore } from 'src/stores/convo.store';
import { TheWorkflows } from '../the-workflows';
import { entityKey } from 'src/entities/base.entity';
import { useProfilesStore } from 'src/stores/profiles.store';

TheWorkflows.on({
  type: 'replyToMessage',
  async cb(e) {
    const { item, message, ref, done, error } = e;
    const convoStore = useConvoStore();
    const profileStore = useProfilesStore();
    if (item.iteration) {
      const response = await convoStore.sendMessage(
        item.projectKey,
        entityKey(item.iteration),
        item.key,
        profileStore.presentUser?.key || '',
        { type: 'response', message: message, ref: entityKey(ref) }
      );
      done && done(response);
    } else if (error) {
      error('Item is not part of iteration');
    }
  },
})
