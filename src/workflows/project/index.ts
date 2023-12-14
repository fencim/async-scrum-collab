import { useProjectStore } from 'src/stores/projects.store';
import { TheWorkflows } from '../the-workflows';

TheWorkflows.on({
  type: 'createProject',
  async cb(e) {
    const projectStore = useProjectStore();
    const result = await projectStore.saveProject(e.project);
    e.done && e.done(result);
  },
});

TheWorkflows.on({
  type: 'updateProject',
  async cb(e) {
    const projectStore = useProjectStore();
    const result = await projectStore.saveProject(e.project);
    e.done && e.done(result);
  },
});



