import { useProfilesStore } from 'src/stores/profiles.store';
import { TheWorkflows } from '../the-workflows';

TheWorkflows.on({
  type: 'loginWithGoogle',
  loggable: 'post-operation',
  async cb(e) {
    const profileStore = useProfilesStore();
    try {
      await profileStore.signInWithGoogle();
      profileStore.getUserAsync();
      e.done && e.done();
    } catch (error) {
      e.error && e.error(e as Error);
    }
  },
})
