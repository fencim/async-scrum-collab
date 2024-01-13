import { useProfilesStore } from 'src/stores/profiles.store';
import { TheWorkflows } from '../the-workflows';
import { useConvoStore } from 'src/stores/convo.store';
import { IQuestion, IResponse } from 'src/entities';
import { entityKey } from 'src/entities/base.entity';

TheWorkflows.on({
  type: 'resolveQuestionOf',
  async cb(e) {
    const profileStore = useProfilesStore();
    const convoStore = useConvoStore();
    const { message, resolution, item, done, error } = e;
    if (profileStore.presentUser && item.iteration) {
      try {
        const messages = await convoStore.ofDiscussion(
          entityKey(item.iteration), item.key
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
