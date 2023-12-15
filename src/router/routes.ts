import { RouteRecordRaw } from 'vue-router';
import mainLayout from 'src/layouts/MainLayout.vue';
import plainLayout from 'src/layouts/PlainLayout.vue';
import authRoutes from './auth.routes';
const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: () => Promise.resolve(plainLayout),
    children: [...authRoutes]
  },
  {
    path: '/',
    component: () => Promise.resolve(mainLayout),
    children: [
      {
        name: 'home',
        meta: { actions: true },
        path: '', components: {
          default: () => import('src/modules/home/HomePage.vue'),
          header: () => import('src/modules/home/HomeToolbar.vue'),
          actions: () => import('src/modules/home/HomeActionList.vue'),
        }
      }],
  },
  {
    path: '/:project',
    component: () => Promise.resolve(mainLayout),
    children: [
      {
        name: 'projectHome',
        meta: { actions: true },
        path: 'timeline', components: {
          default: () => import('src/modules/project/ProjectPage.vue'),
          header: () => import('src/modules/project/ProjectToolbar.vue'),
          actions: () => import('src/modules/project/ProjectActionList.vue')
        }
      }, {
        name: 'settings',
        meta: { actions: true },
        path: 'settings', components: {
          default: () => import('src/modules/project/ProjectSettingsPage.vue'),
          header: () => import('src/modules/project/ProjectToolbar.vue'),
          actions: () => import('src/modules/project/ProjectActionList.vue')
        },
      }, {
        name: 'board',
        path: 'board/:iteration?/:item?',
        meta: { actions: true },
        components: {
          default: () => import('src/modules/task-board/IterationTaskBoardPage.vue'),
          header: () => import('src/modules/project/ProjectToolbar.vue'),
          actions: () => import('src/modules/project/ProjectActionList.vue')

        }
      }, {
        name: 'calendar',
        path: 'calendar/:iteration?',
        meta: { actions: true },
        components: {
          default: () => import('src/modules/calendar/CalendarPage.vue'),
          header: () => import('src/modules/project/ProjectToolbar.vue'),
          actions: () => import('src/modules/project/ProjectActionList.vue')

        }
      },
      {
        name: 'iteration',
        path: ':iteration', components: {
          default: () => import('src/modules/iteration/DailyTimelinePage.vue'),
          header: () => import('src/modules/iteration/IterationToolbar.vue'),
          actions: () => import('src/modules/iteration/IterationActionList.vue')
        },
        meta: { actions: true }
      }, {
        name: 'burn-down',
        path: ':iteration/burn-down', components: {
          default: () => import('src/modules/iteration/BurnDownPage.vue'),
          header: () => import('src/modules/iteration/IterationToolbar.vue'),
          actions: () => import('src/modules/iteration/IterationActionList.vue')
        },
        meta: { actions: true }
      },
      {
        name: 'convo',
        path: ':iteration/:ceremony/:item?/convo', components: {
          default: () => import('src/modules/ceremony/ConvoPage.vue'),
          header: () => import('src/modules/ceremony/CeremonyToolbar.vue'),
          menu: () => import('src/modules/ceremony/CeremonyMenuList.vue'),
          actions: () => import('src/modules/ceremony/CeremonyActionList.vue'),
        },
        meta: { menus: true, actions: true }
      },
      {
        name: 'ceremony',
        path: ':iteration/:ceremony/convo', components: {
          default: () => import('src/modules/ceremony/ConvoPage.vue'),
          header: () => import('src/modules/ceremony/CeremonyToolbar.vue'),
          menu: () => import('src/modules/ceremony/CeremonyMenuList.vue'),
          actions: () => import('src/modules/ceremony/CeremonyActionList.vue'),
        },
        meta: { menus: true, actions: true }
      },],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
