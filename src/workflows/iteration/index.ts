import { useIterationStore } from 'src/stores/iterations.store';
import { TheWorkflows } from '../the-workflows';
import { IIteration } from 'src/entities';
import { useCeremonyStore } from 'src/stores/ceremonies.store';
import { date } from 'quasar';

TheWorkflows.on({
  type: 'createIteration',
  permissions: ['admin', 'moderator'],
  loggable: 'operation',
  async cb(e) {
    const iterationStore = useIterationStore();
    const ceremonyStore = useCeremonyStore();
    const iteration: IIteration = {
      ...e.details,
      key: e.details.projectKey + 'S' + iterationStore.iterations.length
    }
    await iterationStore.saveIteration(iteration);
    let progress = 0.2;
    e.progress && e.progress(progress, 'Saving Iteration Details');
    const planScheds = e.ceremonies || [];
    for (let index = 0; index < planScheds.length; index++) {
      progress = 0.2 + 0.8 * (index / planScheds.length);
      const sched = planScheds[index];
      e.progress && e.progress(progress, 'Scheduling ' + sched.desc);
      if (!sched.check) continue;
      await ceremonyStore.saveCeremony({
        key: sched.key,
        projectKey: iteration.projectKey,
        discussions: [],
        start: date.formatDate(sched.start),
        end: date.formatDate(sched.end),
        type: sched.type,
        iterationKey: iteration.key,
      });
    }
    e.done(iteration);
  }
})

TheWorkflows.on({
  type: 'updateIteration',
  permissions: ['admin', 'moderator'],
  loggable: 'operation',
  async cb(e) {
    const iteration = e.iteration;
    await useIterationStore().saveIteration(iteration);
    e.done && e.done(iteration);
  },
})
