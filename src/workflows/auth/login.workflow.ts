import { useProfilesStore } from 'src/stores/profiles.store';
import { TheWorkflows } from '../the-workflows';
import { date } from 'quasar';

TheWorkflows.on({
  type: 'login',
  loggable: 'post-operation',
  async cb(e) {
    const profileStore = useProfilesStore();
    try {
      const result = await profileStore.signIn(e.username, e.password);
      if (result.user.metadata.lastSignInTime) {
        const dateNow = new Date();
        const signedInDate = new Date(result.user.metadata.lastSignInTime);
        const diff = date.getDateDiff(dateNow, signedInDate, 'seconds');
        await profileStore.setTimeDiff(diff);
      }

      e.done && e.done({ username: e.username });
    } catch (err) {
      e.error && e.error(new Error(String(err)));
    }

  }
})
