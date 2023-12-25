import { useProfilesStore } from 'src/stores/profiles.store';
import { TheWorkflows } from '../the-workflows';

TheWorkflows.on({
  type: 'loginWithGoogle',
  async cb(e) {
    const profileStore = useProfilesStore();
    try {
      await profileStore.signInWithGoogle();
      e.done && e.done();
    } catch (error) {
      e.error && e.error(e as Error);
    }
  },
})
