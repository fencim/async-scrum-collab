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
function newSubTask(refStory: DiscussionItem) {
  newTaskPreFields.value.refItem = refStory;
  newTaskPreFields.value.type = 'task';
  showItemTopSheet.value = true;
}
TheDialogs.on({
  type: 'newTask',
  cb: (e) => {
    newTask(e.status);
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
  <q-dialog v-model="showItemTopSheet" :position="'top'">
    <discussion-form
      :type="newTaskPreFields.type || 'story'"
      :status="newTaskPreFields.status || ''"
      :iteration="newTaskPreFields.iteration"
      :ref-item="newTaskPreFields.refItem"
      :item="newTaskPreFields.item"
    />
  </q-dialog>
</template>
