import { route } from 'quasar/wrappers';
import { useIterationStore } from 'src/stores/iterations.store';
import { useProfilesStore } from 'src/stores/profiles.store';
import { useProjectStore } from 'src/stores/projects.store';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);
  const profileStore = useProfilesStore();
  const projectStore = useProjectStore();
  const iterationStore = useIterationStore();
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(
      process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE
    ),
  });



  Router.beforeEach(async (to, from, next) => {
    if (!profileStore.getUser()) await profileStore.authenticate();
    if (profileStore.getUser() || (to.meta && to.meta.anonymous)) {
      if (to.params && to.params['project'] && (!projectStore.activeProject || projectStore.activeProject.key != to.params['project'])) {
        await projectStore.selectProject(to.params['project'] as string);
      } else if (!to.params['project']) {
        await projectStore.selectProject('');
      }
      if (projectStore.activeProject && to.params && to.params['iteration']
        && (!iterationStore.activeIteration || iterationStore.activeIteration.key != to.params['iteration'])) {
        await iterationStore.selectIteration(projectStore.activeProject.key, to.params['iteration'] as string);
      }
      else if (!to.params['iteration']) {
        await iterationStore.selectIteration('', '');
      }
      document.title = 'Async SCRUM Collab: ' + String(to.name).toUpperCase();
      next();
    } else {
      next({
        name: 'login'
      })
    }
  })

  return Router;
});
