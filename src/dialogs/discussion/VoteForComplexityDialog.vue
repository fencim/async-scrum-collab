<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { DiscussionItem } from 'src/entities';
import { useProfilesStore } from 'src/stores/profiles.store';
import { TheWorkflows } from 'src/workflows/the-workflows';
import { ref } from 'vue';
import { TheDialogs } from '../the-dialogs';
const $q = useQuasar();
const profileStore = useProfilesStore();
const dialogVote = ref(false);
const item = ref<DiscussionItem>();
const doneCb = ref<VoidCallback>();
const errorCb = ref<ErrorCallback>();
async function submitVote(vote: string) {
  if (!item.value) return;
  TheWorkflows.emit({
    type: 'voteForComplexity',
    arg: {
      item: item.value,
      vote: vote,
      voter: profileStore.theUser?.key || '',
      done: () => {
        dialogVote.value = false;
        doneCb.value && doneCb.value();
      },
      error: (e) => {
        $q.notify({
          message: String(e),
          color: 'negative',
          icon: 'error',
        });
        dialogVote.value = false;
        errorCb.value && errorCb.value(new Error(String(e)));
      },
    },
  });
}
TheDialogs.on({
  type: 'voteForItemComplexity',
  cb(e) {
    item.value = e.item;
    dialogVote.value = true;
  },
});
</script>
<template>
  <q-dialog v-model="dialogVote">
    <q-card class="q-pa-sm text-center">
      <q-card-section class="text-right">
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section class="row justify-center">
        <q-card
          @click="submitVote(c)"
          class="pocker-card bg-grey-9 q-pa-sm text-h5 cursor-pointer q-ma-sm"
          v-for="c in ['1', '2', '3', '5', '8', '13', '21']"
          :key="c"
          style="width: 100px"
          v-ripple.early
        >
          <div class="top-left text-left">
            {{ c }}<br />
            <div style="color: black">♥</div>
          </div>
          <div></div>
          <div></div>
          <div></div>
          <div class="heart">♥</div>
          <div></div>
          <div></div>
          <div></div>
          <div class="bottom-right text-left">
            {{ c }}<br />
            <div style="color: black">♥</div>
          </div>
        </q-card>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
