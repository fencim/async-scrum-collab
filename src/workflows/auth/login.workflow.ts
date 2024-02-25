import { useProfilesStore } from 'src/stores/profiles.store';
import { TheWorkflows } from '../the-workflows';

TheWorkflows.on({
  type: 'login',
  loggable: 'post-operation',
  async cb(e) {
    const profileStore = useProfilesStore();
    try {
      await profileStore.signIn(e.username, e.password);
      e.done && e.done({ username: e.username });
    } catch (err) {
      e.error && e.error(new Error(String(err)));
    }

  }
})
