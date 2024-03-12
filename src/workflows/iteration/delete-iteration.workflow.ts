import { useIterationStore } from 'src/stores/iterations.store';
import { TheWorkflows } from '../the-workflows';
import { useCeremonyStore } from 'src/stores/ceremonies.store';

const ceremonyStore = useCeremonyStore();
const iterationStore = useIterationStore();
TheWorkflows.on({
  type: 'deleteIteration',
  permissions: ['admin', 'moderator'],
  loggable: 'operation',
  async cb(e) {
    const iteration = e.iteration;
    const ceremonies = ceremonyStore.ceremonies.filter(c => c.iterationKey == iteration.key);
    await Promise.all(ceremonies.map((c => ceremonyStore.deleteCeremony(c))));
    await iterationStore.deleteIteration(iteration);
    e.done && e.done();
  },
})
