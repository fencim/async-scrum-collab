import { RouteRecordRaw } from 'vue-router';
import Page from 'src/modules/home/HomePage.vue';
import ToolBar from 'src/modules/home/HomeToolbar.vue';
import ActionList from 'src/modules/home/HomeActionList.vue';
export default [
  {
    name: 'home',
    meta: { actions: true },
    path: '', components: {
      default: () => Promise.resolve(Page),
      header: () => Promise.resolve(ToolBar),
      actions: () => Promise.resolve(ActionList)
    }
  }
] as RouteRecordRaw[];
