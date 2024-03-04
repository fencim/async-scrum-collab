<template>
  <q-chip clickable dense :color="completedDate ? 'secondary' : 'negative'"
    >{{ (completedDate && formatDate(completedDate)) || 'ND' }}
    <q-popup-proxy
      v-if="activeStore.canUserModerate"
      cover
      transition-show="scale"
      transition-hide="scale"
    >
      <q-date v-model="completedDate" :options="withInIterationOnly">
        <div class="row items-center justify-end">
          <q-btn
            v-close-popup
            label="Ok"
            @click="updateCompletedDate(completedDate)"
            color="primary"
            flat
          />
        </div>
      </q-date>
    </q-popup-proxy>
    <q-tooltip>Completed Date</q-tooltip>
  </q-chip>
</template>
<script lang="ts" setup>
import { date, useQuasar } from 'quasar';
import { DiscussionItem } from 'src/entities';
import { useActiveStore } from 'src/stores/active.store';
import { useIterationStore } from 'src/stores/iterations.store';
import { TheWorkflows } from 'src/workflows/the-workflows';
import { ref } from 'vue';
const $q = useQuasar();
const iterationStore = useIterationStore();
const activeStore = useActiveStore();
const props = defineProps<{
  task: DiscussionItem;
}>();
const completedDate = ref(props.task.doneDate || '');
function formatDate(d: string) {
  return d && date.formatDate(d, 'MMM DD');
}
function withInIterationOnly(d: string) {
  let iteration = props.task.iteration;
  if (typeof iteration == 'string') {
    iteration = iterationStore.iterations.find((i) => i.key == iteration);
  }
  if (typeof iteration != 'object') return true;
  const start = date.formatDate(iteration.start, 'YYYY/MM/DD');
  const end = date.formatDate(iteration.end, 'YYYY/MM/DD');
  return (!iteration.start || d >= start) && (!iteration.end || d <= end);
}
function updateCompletedDate(d: string) {
  TheWorkflows.emit({
    type: 'updateDiscussionFields',
    arg: {
      payload: {
        ...props.task,
        doneDate: d,
      },
      error(err) {
        $q.notify({
          color: 'negative',
          message: String(err),
          icon: 'error',
        });
      },
    },
  });
}
</script>
