<script setup lang="ts">
import { ref } from 'vue';
import { DiscussionItem } from 'src/entities';

import { TheDialogs } from '../the-dialogs';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { TheWorkflows } from 'src/workflows/the-workflows';

const discussionStore = useDiscussionStore();
const discussion = ref<DiscussionItem>();
const isDialogShown = ref(false);
async function deleteDiscussion() {
  if (!discussion.value) return;
  await TheWorkflows.emitPromised({
    type: 'deleteIssue',
    arg: {
      issue: discussion.value,
    },
  });
  isDialogShown.value = false;
}

TheDialogs.on({
  type: 'deleteTaskDialog',
  cb(e) {
    discussion.value = e.item;
    isDialogShown.value = true;
  },
});
</script>
<template>
  <q-dialog v-model="isDialogShown" persistent>
    <q-card v-if="discussion">
      <q-card-section class="row items-center">
        <q-avatar icon="delete_sweep" color="negative" text-color="white" />
        <span class="q-ml-sm">You are about to Delete the discussion.</span>
      </q-card-section>
      <q-card-section>{{
        discussionStore.describeDiscussion(discussion)
      }}</q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="info" v-close-popup />
        <q-btn
          push
          flat
          icon="delete"
          label="Proceed"
          color="negative"
          @click="deleteDiscussion"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
