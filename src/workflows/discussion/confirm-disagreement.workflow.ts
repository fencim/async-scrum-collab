import { useConvoStore } from 'src/stores/convo.store';
import { TheWorkflows } from '../the-workflows';
import { entityKey } from 'src/entities/base.entity';
import { useProfilesStore } from 'src/stores/profiles.store';
import { IQuestion } from 'src/entities';
TheWorkflows.on({
  type: 'confirmAgreement',
  permissions: ['admin', 'moderator', 'member'],
  loggable: 'operation',
  async cb(e) {
    const { item, message, reaction, done, error } = e;
    const convoStore = useConvoStore();
    const profileStore = useProfilesStore();
    if (item.iteration) {
      const question = await convoStore.sendMessage(
        item.projectKey,
        entityKey(item.iteration),
        item.key,
        profileStore.presentUser?.key || '',
        {
          type: 'reaction',
          reaction: reaction,
          message: message ? message :
            (reaction == 'disagree' ? 'I disagree on the readiness of this item'
              : 'I agree on the readiness of this item'),
        }
      );
      if (profileStore.presentUser) {
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
