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
        path: '', components: {
          default: () => import('src/modules/home/HomePage.vue'),
          header: () => import('src/modules/home/HomeToolbar.vue'),
          actions: () => import('src/modules/home/HomeActionList.vue'),
        }
      }, {
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
        path: '', components: {
          default: () => import('src/modules/project/ProjectPage.vue'),
          header: () => import('src/modules/project/ProjectToolbar.vue'),
          actions: () => import('src/modules/project/ProjectActionList.vue')
        }
      }, {
        path: 'edit', components: {
          default: () => import('src/modules/project/NewProjectPage.vue'),
        }
      }, {
        path: 'iteration/new', components: {
          default: () => import('src/modules/iteration/NewIterationPage.vue'),
        }
      }],
  },
  {
    path: '/:project/:iteration',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'iteration',
        path: '', components: {
          default: () => import('src/modules/iteration/DailyTimelinePage.vue'),
          header: () => import('src/modules/iteration/IterationToolbar.vue'),

        }
      }, {
        name: 'iterationform',
        path: 'edit', components: {
          default: () => import('src/modules/iteration/NewIterationPage.vue'),
        }
      }, {
        path: ':ceremony/edit', components: {
          default: () => import('src/modules/ceremony/CeremonyFormPage.vue'),
        }
      }, {
        path: ':ceremony/discussion/new', components: {
          default: () => import('src/modules/ceremony/DiscussionFormPage.vue'),
        }
      },
      {
        name: 'editDiscussion',
        path: ':ceremony/:item/edit', components: {
          default: () => import('src/modules/ceremony/DiscussionFormPage.vue'),
          header: () => import('src/modules/ceremony/CeremonyToolbar.vue'),
          menu: () => import('src/modules/ceremony/CeremonyMenuList.vue'),
          actions: () => import('src/modules/ceremony/CeremonyActionList.vue'),
        },
        meta: { actions: true }
      },
      {
        name: 'convo',
        path: ':ceremony/:item?/convo', components: {
          default: () => import('src/modules/ceremony/ConvoPage.vue'),
          header: () => import('src/modules/ceremony/CeremonyToolbar.vue'),
          menu: () => import('src/modules/ceremony/CeremonyMenuList.vue'),
          actions: () => import('src/modules/ceremony/CeremonyActionList.vue'),
        },
        meta: { actions: true }
      },
      {
        name: 'ceremony',
        path: ':ceremony/convo', components: {
          default: () => import('src/modules/ceremony/ConvoPage.vue'),
          header: () => import('src/modules/ceremony/CeremonyToolbar.vue'),
          menu: () => import('src/modules/ceremony/CeremonyMenuList.vue'),
          actions: () => import('src/modules/ceremony/CeremonyActionList.vue'),
        },
        meta: { actions: true }
      },
      {
        name: 'discussionDetails',
        path: ':ceremony/:item', components: {
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
    meta: { anonymous: true },
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
