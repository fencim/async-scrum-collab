import { useConvoStore } from 'src/stores/convo.store';
import { TheWorkflows } from '../the-workflows';
import { useCeremonyStore } from 'src/stores/ceremonies.store';

TheWorkflows.on({
  type: 'resetConfidenceVoting',
  permissions: ['admin', 'moderator'],
  loggable: 'operation',
  async cb(e) {
    const { ceremony, moderator, done, error } = e;
    const convoStore = useConvoStore();
    const ceremonyStore = useCeremonyStore();

    if (ceremony && ceremony.iterationKey && ceremony.type == 'planning') {
      await convoStore.sendMessage(
        ceremony.projectKey,
        ceremony.iterationKey,
        ceremony.key,
        moderator,
        {
          type: 'vote',
          vote: '0',
          ref: 'ceremony:' + ceremony.key,
          message: `I am resetting confidence voting for this ${ceremony.type} ceremony`,
        }
      );
      ceremony.confidence = 0;
      await ceremonyStore.patchCeremony(ceremony.key, ['confidence'], ceremony);
      done && done(ceremony);
    } else {
      //not part of iteration
      error && error(new Error('Invalid Ceremony'));
      return;
    }
  },
})
