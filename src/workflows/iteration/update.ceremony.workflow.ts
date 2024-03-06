import { TheWorkflows } from '../the-workflows';
import { useCeremonyStore } from 'src/stores/ceremonies.store';
import { IPlanningCeremony } from 'src/entities';


TheWorkflows.on({
  type: 'updateCeremony',
  permissions: ['admin', 'moderator'],
  loggable: 'operation',
  async cb(e) {
    const ceremony = e.ceremony;
    await useCeremonyStore().patchCeremony(ceremony.key, ['start', 'end'], ceremony as IPlanningCeremony);
    e.done && e.done(ceremony);
  },
})
