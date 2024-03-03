import { TheWorkflows } from '../the-workflows';
import { useConvoStore } from 'src/stores/convo.store';
import { useActiveStore } from 'src/stores/active.store';
import { useCeremonyStore } from 'src/stores/ceremonies.store';
import { IPlanningCeremony } from 'src/entities';

TheWorkflows.on({
  type: 'assessCeremony',
  permissions: ['admin', 'moderator', 'member'],
  async cb(e) {
    const ceremonyStore = useCeremonyStore();
    const convoStore = useConvoStore();
    const activeStore = useActiveStore();
    const project = activeStore.activeProject;

    const { ceremony, done, error } = e;
    const convo = await convoStore.ofDiscussion(
      ceremony.iterationKey,
      ceremony.key
    );
    try {
      const report = ceremonyStore.checkCompleteness(ceremony, [...new Set(project?.members)], convo);
      if (ceremony.progress != report[0].progress) {
        ceremony.progress = report[0].progress;
        await ceremonyStore.patchCeremony(ceremony.key, ['progress'], ceremony as IPlanningCeremony);
      }
      done && done(report);
    } catch (err) {
      error && error(new Error(String(err)));
    }
  },
})
