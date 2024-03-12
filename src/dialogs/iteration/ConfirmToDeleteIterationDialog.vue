<script setup lang="ts">
import { ref } from 'vue';
import { IIteration } from 'src/entities';

import { TheDialogs } from '../the-dialogs';
import { TheWorkflows } from 'src/workflows/the-workflows';
import { date, useQuasar } from 'quasar';

const iteration = ref<IIteration>();
const isDialogShown = ref(false);
const $q = useQuasar();
async function deleteIteration() {
  if (!iteration.value) return;
  await TheWorkflows.emitPromised({
    type: 'deleteIteration',
    arg: {
      iteration: iteration.value,
      done() {
        isDialogShown.value = false;
      },
      error(err) {
        isDialogShown.value = false;
        $q.notify({
          message: String(err),
          icon: 'error',
          color: 'negative',
        });
      },
    },
  });
}

TheDialogs.on({
  type: 'deleteIterationDialog',
  cb(e) {
    iteration.value = e.iteration;
    isDialogShown.value = true;
  },
});
</script>
<template>
  <q-dialog v-model="isDialogShown" persistent>
    <q-card v-if="iteration">
      <q-card-section class="row items-center">
        <q-avatar icon="delete_sweep" color="negative" text-color="white" />
        <span class="q-ml-sm"
          >You are about to DELETE the Sprint and all ceremonies under it.</span
        >
      </q-card-section>
      <q-card-section
        >{{ iteration.name }} ({{
          date.formatDate(iteration.start, 'MMM DD')
        }}
        - {{ date.formatDate(iteration.end, 'MMM DD') }} )</q-card-section
      >
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="info" v-close-popup />
        <q-btn
          push
          flat
          icon="delete"
          label="Proceed"
          color="negative"
          @click="deleteIteration"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
