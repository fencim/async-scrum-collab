import { RouteRecordRaw } from 'vue-router';
import mainLayout from 'src/layouts/MainLayout.vue';
import plainLayout from 'src/layouts/PlainLayout.vue';
import ErrorNotFound from 'pages/ErrorNotFound.vue';
import authRoutes from './auth.routes';
import homeRoutes from './home.routes';
import projectRoutes from './project.routes';
const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: () => (plainLayout),
    children: [...authRoutes]
  },
  {
    path: '/',
    component: () => (mainLayout),
    children: [...homeRoutes],
  },
  {
    path: '/:project',
    component: () => (mainLayout),
    children: [...projectRoutes],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => ErrorNotFound,
  },
];

export default routes;
