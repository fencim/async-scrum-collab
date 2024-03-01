import { useConvoStore } from 'src/stores/convo.store';
import { TheWorkflows } from '../the-workflows';
import { entityKey } from 'src/entities/base.entity';
import { useProfilesStore } from 'src/stores/profiles.store';
import { CeremonyTypes, DiscussionItem, ICeremony, IQuestion } from 'src/entities';

TheWorkflows.on({
  type: 'askQuestion',
  permissions: ['admin', 'moderator', 'member', 'guest'],
  loggable: 'operation',
  async cb(e) {
    const { item, message, done, error } = e;
    const convoStore = useConvoStore();
    const profileStore = useProfilesStore();
    const ceremony = CeremonyTypes.includes(item.type as ICeremony['type']) ? item as ICeremony : undefined;
    const discussion = !CeremonyTypes.includes(item.type as ICeremony['type']) ? item as DiscussionItem : undefined;
    const iterationKey = ceremony?.iterationKey || (discussion?.iteration && entityKey(discussion?.iteration)) || '';
    try {
      const question = await convoStore.sendMessage(
        item.projectKey,
        iterationKey,
        item.key,
        profileStore.presentUser?.key || '',
        {
          type: 'question',
          message: message,
        }
      );
      done && done(question as IQuestion);
    } catch (err) {
      error && error(err)
    }
  },
})
