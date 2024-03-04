import { TheWorkflows } from '../the-workflows';
import { useConvoStore } from 'src/stores/convo.store';
import { IRetroFeedback } from 'src/entities';

TheWorkflows.on({
  type: 'mergeFeedbackWith',
  permissions: ['admin', 'moderator', 'member'],
  loggable: 'operation',
  async cb(e) {
    const convoStore = useConvoStore();
    const { message, withMsg, done } = e;
    const msg = { ...message };
    msg.groupWith = withMsg;
    await convoStore.updateMessage<IRetroFeedback>(msg.key, 'groupWith', msg.groupWith);
    done && done(msg);
  },
})
