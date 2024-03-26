import { useProfilesStore } from 'src/stores/profiles.store';
import { TheWorkflows } from '../the-workflows';
import { date } from 'quasar';

TheWorkflows.on({
  type: 'loginWithGoogle',
  loggable: 'post-operation',
  async cb(e) {
    const profileStore = useProfilesStore();
    try {
      const result = await profileStore.signInWithGoogle();
      if (result.user.metadata.lastSignInTime) {
        const dateNow = new Date();
        const signedInDate = new Date(result.user.metadata.lastSignInTime);
        const diff = date.getDateDiff(dateNow, signedInDate, 'seconds');
        await profileStore.setTimeDiff(diff);
      }
      const user = await profileStore.getUserAsync();
      e.done && e.done({
        username: user?.email || 'user'
      });
    } catch (error) {
      e.error && e.error(e as Error);
    }
  },
})
