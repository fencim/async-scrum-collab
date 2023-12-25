<script setup lang="ts">
import { DiscussionItem, IIteration } from 'src/entities';
import { ref } from 'vue';
import { TheDialogs } from '../the-dialogs';
import DiscussionForm from 'src/components/DiscussionForm.vue';

const newTaskPreFields = ref({
  item: undefined as DiscussionItem | undefined,
  type: 'story' as DiscussionItem['type'],
  status: '',
  iteration: undefined as IIteration | undefined,
  refItem: undefined as DiscussionItem | undefined,
});
const showTopSheet = ref(false);
function editTask(task: DiscussionItem) {
  newTaskPreFields.value.type = task.type;
  newTaskPreFields.value.status = task.status || newTaskPreFields.value.status;
  newTaskPreFields.value.item = task;
  newTaskPreFields.value.iteration = task.iteration as IIteration;
  showTopSheet.value = true;
}
function newTask(
  status?: string,
  type?: DiscussionItem['type'],
  iteration?: IIteration
) {
  newTaskPreFields.value.type = type || 'story';
  newTaskPreFields.value.status = status || newTaskPreFields.value.status;
  newTaskPreFields.value.iteration = iteration;
  newTaskPreFields.value.refItem = undefined;
  showTopSheet.value = true;
}
function newSubTask(refItem: DiscussionItem) {
  newTaskPreFields.value.refItem = refItem;
  newTaskPreFields.value.type =
    refItem.type == 'goal'
      ? 'objective'
      : refItem.type == 'objective'
      ? 'story'
      : 'task';
  newTaskPreFields.value.iteration = refItem.iteration as IIteration;
  showTopSheet.value = true;
}
TheDialogs.on({
  type: 'newTask',
  cb: (e) => {
    newTask(e.status, e.type, e.iteration);
  },
});
TheDialogs.on({
  type: 'editTask',
  cb: (e) => {
    editTask(e.item);
  },
});
TheDialogs.on({
  type: 'newSubTask',
  cb: (e) => {
    newSubTask(e.ref);
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
      @close-form="showTopSheet = false"
    />
  </q-dialog>
</template>
