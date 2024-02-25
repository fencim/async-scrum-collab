import { useProjectStore } from 'src/stores/projects.store';
import { TheWorkflows } from '../the-workflows';
import { entityKey } from 'src/entities/base.entity';

TheWorkflows.on({
  type: 'createProject',
  async cb(e) {
    const projectStore = useProjectStore();
    const result = await projectStore.saveProject(e.project, e.icon);
    e.done && e.done(result);
  },
});

TheWorkflows.on({
  type: 'updateProject',
  permissions: ['admin', 'moderator'],
  loggable: 'operation',
  async cb(e) {
    const projectStore = useProjectStore();
    const result = await projectStore.saveProject(e.project, e.icon);
    e.done && e.done(result);
  },
});

TheWorkflows.on({
  type: 'updateProjectSettings',
  permissions: ['admin', 'moderator'],
  loggable: 'operation',
  async cb(e) {
    const { project, settings, value, done } = e;
    const projectStore = useProjectStore();
    const result = await projectStore.updateSettings(entityKey(project), settings, value);
    done && result && done(result);
  },
})
