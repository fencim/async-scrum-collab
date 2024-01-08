import { RouteRecordRaw } from 'vue-router';
import mainLayout from 'src/layouts/MainLayout.vue';
import plainLayout from 'src/layouts/PlainLayout.vue';
import ErrorNotFound from 'pages/ErrorNotFound.vue';
import authRoutes from './auth.routes';
import homeRoutes from './home.routes';
import projectRoutes from './project.routes';
import { IRouteMeta } from './route.meta';
declare module 'vue-router' {
  interface RouteMeta extends IRouteMeta {
    description?: string;
    keywords?: string[];
  }
}
const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: () => Promise.resolve(plainLayout),
    children: [...authRoutes]
  },
  {
    path: '/',
    component: () => Promise.resolve(mainLayout),
    children: [...homeRoutes],
  },
  {
    path: '/:project',
    component: () => Promise.resolve(mainLayout),
    children: [...projectRoutes],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => Promise.resolve(ErrorNotFound),
  },
];

export default routes;
