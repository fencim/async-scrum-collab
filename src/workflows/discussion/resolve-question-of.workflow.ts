import { useProfilesStore } from 'src/stores/profiles.store';
import { TheWorkflows } from '../the-workflows';
import { useConvoStore } from 'src/stores/convo.store';
import { CeremonyTypes, DiscussionItem, ICeremony, IQuestion, IResponse } from 'src/entities';
import { entityKey } from 'src/entities/base.entity';

TheWorkflows.on({
  type: 'resolveQuestionOf',
  permissions: ['admin', 'moderator', 'member'],
  loggable: 'operation',
  async cb(e) {
    const profileStore = useProfilesStore();
    const convoStore = useConvoStore();
    const { message, resolution, item, done, error } = e;
    const ceremony = CeremonyTypes.includes(item.type as ICeremony['type']) ? item as ICeremony : undefined;
    const discussion = !CeremonyTypes.includes(item.type as ICeremony['type']) ? item as DiscussionItem : undefined;
    const iterationKey = ceremony?.iterationKey || (discussion?.iteration && entityKey(discussion?.iteration)) || '';
    if (profileStore.presentUser && iterationKey) {
      try {
        const messages = await convoStore.ofDiscussion(
          iterationKey, item.key
        )
        message.feedback = { ...message.feedback } || {};
        message.feedback[profileStore.presentUser.key] = resolution;
        await convoStore.updateMessage<IResponse>(message.key, 'feedback', message.feedback);
        let qMsg = messages.find((m) => m.key == message.ref);
        while (qMsg && qMsg.type != 'question' && resolution == 'agree') {
          if (qMsg.type == 'response' && qMsg.ref) {
            const ref = qMsg.ref;
            qMsg = messages.find((m) => m.key == ref);
          } else {
            qMsg = undefined;
          }
        }
        if (qMsg && qMsg.type == 'question' && resolution == 'agree') {
          qMsg.resolved = true;
          await convoStore.updateMessage<IQuestion>(qMsg.key, 'resolved', qMsg.resolved);
        }
        done && done(message);
      } catch (e) {
        error && error(e);
      }
    } else {
      error && error('Not part of iteration');
    }
  },
})
