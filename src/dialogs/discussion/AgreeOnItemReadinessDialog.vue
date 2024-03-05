<script setup lang="ts">
import { ref } from 'vue';
import { DiscussionItem } from 'src/entities';

import { TheDialogs } from '../the-dialogs';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { TheWorkflows } from 'src/workflows/the-workflows';

const discussionStore = useDiscussionStore();
const discussion = ref<DiscussionItem>();
const isDialogShown = ref(false);
async function agreeOnItem() {
  if (!discussion.value) return;
  await TheWorkflows.emitPromised({
    type: 'confirmAgreement',
    arg: {
      item: discussion.value,
      reaction: 'agree',
      message: 'I agree this discussion item is ready',
    },
  });
  isDialogShown.value = false;
}
async function disagreeOnItem() {
  if (!discussion.value) return;
  await TheWorkflows.emitPromised({
    type: 'confirmAgreement',
    arg: {
      item: discussion.value,
      reaction: 'disagree',
      message: 'I disagree, this discussion item is not yet ready',
    },
  });
  isDialogShown.value = false;
}
TheDialogs.on({
  type: 'agreeOnItemReadiness',
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
        <q-avatar icon="thumb_up_alt" color="primary" text-color="white" />
        <span class="q-ml-sm"
          >You are about to confirm your agreement on discussion.</span
        >
      </q-card-section>
      <q-card-section>{{
        discussionStore.describeDiscussion(discussion)
      }}</q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="info" v-close-popup />
        <q-btn
          push
          flat
          icon="thumb_down_alt"
          label="Disagree"
          color="secondary"
          @click="disagreeOnItem"
        />
        <q-btn
          push
          flat
          icon="thumb_up_alt"
          label="Agree"
          color="primary"
          @click="agreeOnItem"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
