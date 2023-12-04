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
      <q-dialog v-model="showItemTopSheet" :position="'top'">
        <discussion-form
          :type="newTaskPreFields.type || 'story'"
          :status="newTaskPreFields.status || ''"
          :iteration="newTaskPreFields.iteration"
          :ref-story="newTaskPreFields.refStory"
        />
      </q-dialog>
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
    </q-page-container>
    <TheSynchronizer
      :byModule="synchronizerStore.byModule"
      :synchingTotal="synchronizerStore.synchingTotal"
      :synchingTotalError="synchronizerStore.synchingTotalError"
    />
  </q-layout>
</template>

<script lang="ts" setup>
import { useProfilesStore } from 'src/stores/profiles.store';
import { useProjectStore } from 'src/stores/projects.store';
import { useSynchronizerStore } from 'src/stores/synchronizer.store';
import TheSynchronizer from 'src/components/TheSynchronizer.vue';
import { onMounted, onUpdated, ref } from 'vue';
import { useRoute } from 'vue-router';
import { DiscussionItem, IIteration, IStory } from 'src/entities';
import DiscussionForm from 'src/components/DiscussionForm.vue';
import { convoBus } from 'src/modules/ceremony/convo-bus';
const profileStore = useProfilesStore();
const projectStore = useProjectStore();
const synchronizerStore = useSynchronizerStore();
const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);

onMounted(async () => {
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
//dialogs
const newTaskPreFields = ref({
  type: 'story' as DiscussionItem['type'],
  status: '',
  iteration: undefined as IIteration | undefined,
  refStory: undefined as IStory | undefined,
});
const showItemTopSheet = ref(false);
function newTask(status?: string) {
  newTaskPreFields.value.status = status || newTaskPreFields.value.status;
  showItemTopSheet.value = true;
}
function newSubTask(refStory: IStory) {
  newTaskPreFields.value.refStory = refStory;
  newTaskPreFields.value.type = 'task';
  showItemTopSheet.value = true;
}
convoBus.on('newTask', (e) => {
  newTask(e as string);
});
convoBus.on('newSubTask', (e) => {
  newSubTask(e as IStory);
});
</script>
