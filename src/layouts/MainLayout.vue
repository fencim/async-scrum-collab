<template>
  <q-layout
    view="hHh Lpr lff"
    :style="!$q.platform.is.desktop ? 'zoom: 75%' : ''"
  >
    <q-header reveal elevated>
      <div class="row bg-dark">
        <router-view name="header" />
      </div>
    </q-header>

    <q-drawer
      persistent
      v-model="leftDrawerOpen"
      behavior="desktop"
      mini
      side="left"
      class="no-scroll"
    >
      <router-view name="menu" />
    </q-drawer>
    <q-drawer
      v-model="rightDrawerOpen"
      persistent
      behavior="desktop"
      overlay
      mini
      side="right"
    >
      <router-view name="actions" />
      <q-page-sticky position="bottom-right" :offset="[5, 20]">
        <q-btn round size="lg" dense icon="home" to="/" />
      </q-page-sticky>
    </q-drawer>

    <q-page-container style="padding-right: 56px">
      <router-view />
      <DiscussionDetailsDialog />
      <DiscussionFormDialog />
      <IterationFormDialog />
      <ProjectFormDialog />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { useProfilesStore } from 'src/stores/profiles.store';
import { useProjectStore } from 'src/stores/projects.store';
import { onMounted, onUpdated, ref } from 'vue';
import { useRoute } from 'vue-router';
import DiscussionFormDialog from 'src/dialogs/discussion/DiscussionFormDialog.vue';
import DiscussionDetailsDialog from 'src/dialogs/discussion/DiscussionDetailsDialog.vue';
import IterationFormDialog from 'src/dialogs/iteration/IterationFormDialog.vue';
import ProjectFormDialog from 'src/dialogs/project/ProjectFormDialog.vue';
const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);

onMounted(async () => {
  const profileStore = useProfilesStore();
  const projectStore = useProjectStore();
  await profileStore.init();
  await projectStore.init();
  evalDrawers();
});
onUpdated(() => {
  evalDrawers();
});
const $route = useRoute();
function evalDrawers() {
  rightDrawerOpen.value = !!($route.meta && $route.meta.actions);
  leftDrawerOpen.value = !!($route.meta && $route.meta.menus);
}
</script>
