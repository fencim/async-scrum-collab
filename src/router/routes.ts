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
        name: 'Home',
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
        path: '', components: {
          default: () => import('src/modules/project/ProjectPage.vue'),
          header: () => import('src/modules/project/ProjectToolbar.vue'),
          actions: () => import('src/modules/project/ProjectActionList.vue')
        }
      }, {
        name: 'Edit Project',
        path: 'edit', components: {
          default: () => import('src/modules/project/NewProjectPage.vue'),
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

        }
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
        meta: { actions: true }
      },
      {
        name: 'ceremony',
        path: ':iteration/:ceremony/convo', components: {
          default: () => import('src/modules/ceremony/ConvoPage.vue'),
          header: () => import('src/modules/ceremony/CeremonyToolbar.vue'),
          menu: () => import('src/modules/ceremony/CeremonyMenuList.vue'),
          actions: () => import('src/modules/ceremony/CeremonyActionList.vue'),
        },
        meta: { actions: true }
      },
      {
        name: 'discussionDetails',
        path: ':iteration/:ceremony/:item', components: {
          default: () => import('src/modules/ceremony/DiscussionDetailsPage.vue'),

          header: () => import('src/modules/ceremony/CeremonyToolbar.vue'),
          menu: () => import('src/modules/ceremony/CeremonyMenuList.vue'),
          actions: () => import('src/modules/ceremony/CeremonyActionList.vue'),
        },
        meta: { actions: true }
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
