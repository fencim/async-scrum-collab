import { RouteRecordRaw } from 'vue-router';
import ProjectToolBar from 'src/modules/project/ProjectToolbar.vue';
import ProjectActionList from 'src/modules/project/ProjectActionList.vue';
import IterationToolbar from 'src/modules/iteration/IterationToolbar.vue';
import IterationActionList from 'src/modules/iteration/IterationActionList.vue';
import CeremonyToolbar from 'src/modules/ceremony/CeremonyToolbar.vue';
import CeremonyMenuList from 'src/modules/ceremony/CeremonyMenuList.vue';
import CeremonyActionList from 'src/modules/ceremony/CeremonyActionList.vue';
import ProjectPage from 'src/modules/project/ProjectPage.vue';
import ProjectSettingsPage from 'src/modules/project/ProjectSettingsPage.vue';
import IterationTaskBoardPage from 'src/modules/task-board/IterationTaskBoardPage.vue';
import DailyTimelinePage from 'src/modules/iteration/DailyTimelinePage.vue';
import BurnDownPage from 'src/modules/iteration/BurnDownPage.vue';
import ConvoPage from 'src/modules/ceremony/ConvoPage.vue';
export default [
  {
    name: 'projectHome',
    meta: { actions: true },
    path: 'timeline', components: {
      default: () => ProjectPage,
      header: () => ProjectToolBar,
      actions: () => ProjectActionList
    }
  }, {
    name: 'settings',
    meta: { actions: true },
    path: 'settings', components: {
      default: () => ProjectSettingsPage,
      header: () => ProjectToolBar,
      actions: () => ProjectActionList
    },
  }, {
    name: 'board',
    path: 'board/:iteration?/:item?',
    meta: { actions: true },
    components: {
      default: () => IterationTaskBoardPage,
      header: () => ProjectToolBar,
      actions: () => ProjectActionList

    }
  },
  {
    name: 'iteration',
    path: ':iteration', components: {
      default: () => DailyTimelinePage,
      header: () => IterationToolbar,
      actions: () => IterationActionList
    },
    meta: { actions: true }
  }, {
    name: 'burn-down',
    path: ':iteration/burn-down', components: {
      default: () => BurnDownPage,
      header: () => IterationToolbar,
      actions: () => IterationActionList
    },
    meta: { actions: true }
  },
  {
    name: 'convo',
    path: ':iteration/:ceremony/:item?/convo', components: {
      default: () => ConvoPage,
      header: () => CeremonyToolbar,
      menu: () => CeremonyMenuList,
      actions: () => CeremonyActionList,
    },
    meta: { menus: true, actions: true }
  },
  {
    name: 'ceremony',
    path: ':iteration/:ceremony/convo', components: {
      default: () => ConvoPage,
      header: () => CeremonyToolbar,
      menu: () => CeremonyMenuList,
      actions: () => CeremonyActionList,
    },
    meta: { menus: true, actions: true }
  },
] as RouteRecordRaw[];
