<script setup lang="ts">
import { DiscussionItem, IIteration } from 'src/entities';
import { ref } from 'vue';
import { TheDialogs } from '../the-dialogs';
import DiscussionForm from 'src/components/DiscussionForm.vue';
import { useProfilesStore } from 'src/stores/profiles.store';
import { useRoute } from 'vue-router';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useIterationStore } from 'src/stores/iterations.store';
const $route = useRoute();
const discussionStore = useDiscussionStore();
const newTaskPreFields = ref({
  item: undefined as DiscussionItem | undefined,
  type: 'story' as DiscussionItem['type'],
  status: '',
  iteration: undefined as IIteration | undefined,
  refItem: undefined as DiscussionItem | undefined,
  assignedTo: undefined as string | undefined,
});
const showTopSheet = ref(false);
async function editTask(task: DiscussionItem) {
  newTaskPreFields.value.type = task.type;
  newTaskPreFields.value.status = task.status || newTaskPreFields.value.status;
  newTaskPreFields.value.item = task;
  newTaskPreFields.value.iteration =
    typeof task.iteration == 'object'
      ? task.iteration
      : typeof task.iteration == 'string'
      ? await useIterationStore().getIteration(task.iteration)
      : undefined;
  showTopSheet.value = true;
}
async function newTask(
  status?: string,
  type?: DiscussionItem['type'],
  iteration?: IIteration
) {
  newTaskPreFields.value.type = type || 'story';
  newTaskPreFields.value.status = status || newTaskPreFields.value.status;
  newTaskPreFields.value.iteration = iteration;
  newTaskPreFields.value.refItem = undefined;
  newTaskPreFields.value.item = undefined;
  if (type == 'scrum') {
    const assignedTo = useProfilesStore().theUser?.key;
    newTaskPreFields.value.assignedTo = assignedTo;
    const ceremonyKey = $route.params.ceremony as string;
    const existing = discussionStore.discussions.find(
      (d) => d.assignedTo == assignedTo && d.ceremonyKey == ceremonyKey
    );
    if (existing) {
      errorCb.value && errorCb.value(new Error('Discussion already exists'));
      return;
    }
  }
  showTopSheet.value = true;
}
async function newSubTask(refItem: DiscussionItem) {
  newTaskPreFields.value.item = undefined;
  newTaskPreFields.value.refItem = refItem;
  newTaskPreFields.value.type =
    refItem.type == 'goal'
      ? 'objective'
      : refItem.type == 'objective'
      ? 'story'
      : 'task';
  newTaskPreFields.value.iteration =
    typeof refItem.iteration == 'object'
      ? refItem.iteration
      : typeof refItem.iteration == 'string'
      ? await useIterationStore().getIteration(refItem.iteration)
      : undefined;
  showTopSheet.value = true;
}
const doneCb = ref<(item: DiscussionItem) => void>();
const errorCb = ref<ErrorCallback>();
function onClose(item: DiscussionItem) {
  doneCb.value && doneCb.value(item);
  showTopSheet.value = false;
}
function createAnother(item: DiscussionItem) {
  onClose(item);
  setTimeout(() => {
    showTopSheet.value = true;
  });
}
TheDialogs.on({
  type: 'newTask',
  cb: async (e) => {
    await newTask(e.status, e.type, e.iteration);
    doneCb.value = e.done;
    errorCb.value = e.error;
  },
});
TheDialogs.on({
  type: 'editTask',
  cb: async (e) => {
    await editTask(e.item);
    doneCb.value = e.done;
    errorCb.value = e.error;
  },
});
TheDialogs.on({
  type: 'newSubTask',
  cb: (e) => {
    newSubTask(e.ref);
    doneCb.value = e.done;
    errorCb.value = e.error;
  },
});
</script>
<template>
  <q-dialog v-model="showTopSheet" persistent :position="'top'">
    <discussion-form
      :type="newTaskPreFields.type || 'story'"
      :status="newTaskPreFields.status || ''"
      :iteration="newTaskPreFields.iteration"
      :ref-item="newTaskPreFields.refItem"
      :item="newTaskPreFields.item"
      :assigned-to="newTaskPreFields.assignedTo"
      @close-form="(d) => onClose(d)"
      @create-another="createAnother"
    />
  </q-dialog>
</template>
