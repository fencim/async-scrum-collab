import { TheWorkflows } from '../the-workflows';
import { useCeremonyStore } from 'src/stores/ceremonies.store';
import { date } from 'quasar';

TheWorkflows.on({
  type: 'acceptSprintResult',
  permissions: ['admin', 'moderator'],
  loggable: 'operation',
  async cb(e) {
    const ceremonyStore = useCeremonyStore();
    const { review, completed, missed, done, error } = e;
    try {
      review.totalCompleted = completed;
      review.targetMissed = missed;
      review.dateReviewed = date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss.SSS');
      ceremonyStore.patchCeremony(review.key, ['dateReviewed', 'totalCompleted', 'targetMissed'], review);
      done && done(review);
    } catch (err) {
      error && error(new Error(String(err)));
    }
  },
})
