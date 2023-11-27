import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [

  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        meta: { anonymous: true },
        component: () => import('src/modules/credential/LoginPage.vue')
      }, {
        path: 'register',
        name: 'register',
        meta: { anonymous: true },
        component: () => import('src/modules/credential/RegisterPage.vue')
      }, {
        path: 'logout',
        name: 'logout',
        component: () => import('src/modules/credential/LogoutPage.vue')
      }, {
        name: 'home',
        meta: { actions: true },
        path: '', components: {
          default: () => import('src/modules/home/HomePage.vue'),
          header: () => import('src/modules/home/HomeToolbar.vue'),
          actions: () => import('src/modules/home/HomeActionList.vue'),
        }
      }, {
        name: 'New Project',
        path: '/project/new', components: {
          default: () => import('src/modules/project/NewProjectPage.vue'),
        }
      }],
  },
  {
    path: '/:project',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'Project',
        meta: { actions: true },
        path: 'timeline', components: {
          default: () => import('src/modules/project/ProjectPage.vue'),
          header: () => import('src/modules/project/ProjectToolbar.vue'),
          actions: () => import('src/modules/project/ProjectActionList.vue')
        }
      }, {
        name: 'editProject',
        path: 'edit', components: {
          default: () => import('src/modules/project/NewProjectPage.vue'),
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
        path: 'board/:iteration?',
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
      }, {
        name: 'New Iteration',
        path: 'iteration/new', components: {
          default: () => import('src/modules/iteration/NewIterationPage.vue'),
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
      }, {
        name: 'iterationform',
        path: ':iteration/edit', components: {
          default: () => import('src/modules/iteration/NewIterationPage.vue'),
        }
      }, {
        path: ':iteration/:ceremony/edit', components: {
          default: () => import('src/modules/ceremony/CeremonyFormPage.vue'),
        }
      }, {
        path: ':iteration/:ceremony/discussion/new', components: {
          default: () => import('src/modules/ceremony/DiscussionFormPage.vue'),
        }
      },
      {
        name: 'editDiscussion',
        path: ':iteration/:ceremony/:item/edit', components: {
          default: () => import('src/modules/ceremony/DiscussionFormPage.vue'),
          header: () => import('src/modules/ceremony/CeremonyToolbar.vue'),
          menu: () => import('src/modules/ceremony/CeremonyMenuList.vue'),
          actions: () => import('src/modules/ceremony/CeremonyActionList.vue'),
        },
        meta: { menus: false, actions: false }
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
      },
      {
        name: 'discussionDetails',
        path: ':iteration/:ceremony/:item', components: {
          default: () => import('src/modules/ceremony/DiscussionDetailsPage.vue'),

          header: () => import('src/modules/ceremony/CeremonyToolbar.vue'),
          menu: () => import('src/modules/ceremony/CeremonyMenuList.vue'),
          actions: () => import('src/modules/ceremony/CeremonyActionList.vue'),
        },
        meta: { menus: true, actions: true }
      }],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
