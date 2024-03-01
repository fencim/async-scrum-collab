import { useConvoStore } from 'src/stores/convo.store';
import { TheWorkflows } from '../the-workflows';
import { entityKey } from 'src/entities/base.entity';
import { useProfilesStore } from 'src/stores/profiles.store';
import { CeremonyTypes, DiscussionItem, ICeremony } from 'src/entities';

TheWorkflows.on({
  type: 'replyToMessage',
  permissions: ['admin', 'moderator', 'member'],
  loggable: 'operation',
  async cb(e) {
    const { item, message, ref, done, error } = e;
    const convoStore = useConvoStore();
    const profileStore = useProfilesStore();
    const ceremony = CeremonyTypes.includes(item.type as ICeremony['type']) ? item as ICeremony : undefined;
    const discussion = !CeremonyTypes.includes(item.type as ICeremony['type']) ? item as DiscussionItem : undefined;
    const iterationKey = ceremony?.iterationKey || (discussion?.iteration && entityKey(discussion?.iteration)) || '';
    if (iterationKey) {
      const response = await convoStore.sendMessage(
        item.projectKey,
        iterationKey,
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
