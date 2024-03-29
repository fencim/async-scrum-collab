import { route } from 'quasar/wrappers';
import { useActiveStore } from 'src/stores/active.store';
import { useCeremonyStore } from 'src/stores/ceremonies.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useIterationStore } from 'src/stores/iterations.store';
import { useOnlineUsersStore } from 'src/stores/online-users.store';
import { useProfilesStore } from 'src/stores/profiles.store';
import { useProjectStore } from 'src/stores/projects.store';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import createPinia from 'src/stores';
import { IProject } from 'src/entities';
import { useConvoStore } from 'src/stores/convo.store';

createPinia({});
/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(async function (/* { store, ssrContext } */) {
  const routes = (await import('./routes')).default;
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);
  const activeStore = useActiveStore();
  const profileStore = useProfilesStore();
  const projectStore = useProjectStore();
  const iterationStore = useIterationStore();
  const ceremonyStore = useCeremonyStore();
  const discussionStore = useDiscussionStore();
  const onlineUsersStore = useOnlineUsersStore();
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    await profileStore.authenticate();
    const user = await profileStore.getUserAsync();
    if (user && to.meta.anonymous) {
      next({
        name: 'home'
      })
    } else if (user || (to.meta && to.meta.anonymous)) {
      if (to.params['project']) {
        const project = projectStore.projects.find(p => p.key == to.params['project']);
        if (!project || ![...project.members, ...project.admins, ...project.guests, ...project.moderators].includes(user?.key || '')) {
          next({
            name: 'home'
          })
          return;
        }
      }
      let activeProject: IProject | undefined;
      if (to.params && to.params['project'] && (!projectStore.activeProject || projectStore.activeProject.key != to.params['project'])) {
        activeProject = await projectStore.selectProject(to.params['project'] as string);
      } else if (!to.params['project']) {
        await projectStore.selectProject('');
      }
      if (activeProject) {
        activeStore.selectProject(activeProject);
      }
      if (projectStore.activeProject && to.params && to.params['iteration']
        && (!iterationStore.activeIteration || iterationStore.activeIteration.key != to.params['iteration'])) {
        await iterationStore.selectIteration(projectStore.activeProject.key, to.params['iteration'] as string);
        useConvoStore().ofIteration(to.params['iteration'] as string).subscribe()
      }
      else if (!to.params['iteration']) {
        await iterationStore.selectIteration('', '');
      }
      if (iterationStore.activeIteration && to.params && to.params['ceremony']
        && (!ceremonyStore.activeCeremony || ceremonyStore.activeCeremony.key != to.params['ceremony'])) {
        const iteration = iterationStore.activeIteration;
        const ceremony = await ceremonyStore.withKey(
          iteration.projectKey,
          iteration.key,
          to.params['ceremony'] as string
        );
        ceremonyStore.setActiveCeremony(ceremony);
        discussionStore.setActiveDiscussion(undefined);
      } else if (!to.params['ceremony']) {
        ceremonyStore.setActiveCeremony();
      }
      if (ceremonyStore.activeCeremony && to.params && to.params['item']
        && (!discussionStore.activeDiscussion || discussionStore.activeDiscussion.key != to.params['item'])) {
        const item = await discussionStore.withKey(to.params['item'] as string);
        discussionStore.setActiveDiscussion(item);
      } else {
        discussionStore.setActiveDiscussion(undefined);
      }
      document.title = 'Async SCRUM Collab: ' + String(to.name).toUpperCase();
      if (profileStore.theUser) {
        onlineUsersStore.saveActive({ key: profileStore.theUser?.key || '' });
      }
      next();
    } else if (to.name != 'login') {
      next({
        name: 'login'
      })
    } else {
      next();
    }
  })

  return Router;
});
