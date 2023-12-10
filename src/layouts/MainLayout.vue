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
      <q-dialog v-model="showItemBottomSheet" :position="'bottom'">
        <card-details v-if="selectedItem" :item="selectedItem" />
      </q-dialog>
      <q-dialog v-model="showItemTopSheet" :position="'top'">
        <discussion-form
          :type="newTaskPreFields.type || 'story'"
          :status="newTaskPreFields.status || ''"
          :iteration="newTaskPreFields.iteration"
          :ref-story="newTaskPreFields.refStory"
          :item="newTaskPreFields.item"
        />
      </q-dialog>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { useProfilesStore } from 'src/stores/profiles.store';
import { useProjectStore } from 'src/stores/projects.store';
import { onMounted, onUpdated, ref } from 'vue';
import { useRoute } from 'vue-router';
import { DiscussionItem, IIteration, IStory } from 'src/entities';
import CardDetails from 'src/components/CardDetails.vue';
import DiscussionForm from 'src/components/DiscussionForm.vue';
import { convoBus } from 'src/modules/ceremony/convo-bus';
const profileStore = useProfilesStore();
const projectStore = useProjectStore();
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
const selectedItem = ref<undefined | DiscussionItem>();
const showItemBottomSheet = ref(false);
function viewTaskDetails(issue: DiscussionItem) {
  selectedItem.value = issue;
  showItemBottomSheet.value = true;
}
convoBus.on('viewTask', (e) => {
  viewTaskDetails(e as DiscussionItem);
});
//new discussion
const newTaskPreFields = ref({
  item: undefined as DiscussionItem | undefined,
  type: 'story' as DiscussionItem['type'],
  status: '',
  iteration: undefined as IIteration | undefined,
  refStory: undefined as IStory | undefined,
});
const showItemTopSheet = ref(false);
function editTask(task: DiscussionItem) {
  newTaskPreFields.value.type = task.type;
  newTaskPreFields.value.status = task.status || newTaskPreFields.value.status;
  newTaskPreFields.value.item = task;
  showItemTopSheet.value = true;
}
function newTask(status?: string) {
  newTaskPreFields.value.type = 'story';
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
convoBus.on('editTask', (e) => {
  editTask(e as DiscussionItem);
});
convoBus.on('newSubTask', (e) => {
  newSubTask(e as IStory);
});
</script>
