import { useConvoStore } from 'src/stores/convo.store';
import { TheWorkflows } from '../the-workflows';
import { useProfilesStore } from 'src/stores/profiles.store';
import { useActiveStore } from 'src/stores/active.store';

TheWorkflows.on({
  type: 'sendMessage',
  permissions: ['admin', 'moderator', 'member', 'guest'],
  loggable: 'operation',
  async cb(e) {
    const { iteration, discussion, message, done, error } = e;
    const convoStore = useConvoStore();
    const profileStore = useProfilesStore();
    const activeStore = useActiveStore();

    if (activeStore.activeProject) {
      const info = await convoStore.sendMessage(
        activeStore.activeProject.key,
        iteration,
        discussion,
        profileStore.presentUser?.key || '',
        {
          type: 'message',
          message: message,
        }
      );
      done && done(info);
    } else if (error) {
      error('Item is not part of iteration');
    }
  },
})
