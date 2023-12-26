import { RouteRecordRaw } from 'vue-router';

import loginPage from 'src/modules/credential/LoginPage.vue';
import registerPage from 'src/modules/credential/RegisterPage.vue'
import logoutPage from 'src/modules/credential/LogoutPage.vue';

export default [{
  path: 'login',
  name: 'login',
  meta: { anonymous: true },
  component: () => (loginPage)
}, {
  path: 'register',
  name: 'register',
  meta: { anonymous: true },
  component: () => (registerPage)
}, {
  path: 'logout',
  name: 'logout',
  component: () => (logoutPage)
}] as RouteRecordRaw[];
