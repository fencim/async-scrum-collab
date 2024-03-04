<template>
  <q-chip clickable dense :color="dueDate ? 'secondary' : 'negative'"
    >{{ (dueDate && formatDate(dueDate)) || 'ND' }}
    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
      <q-date v-model="dueDate" :options="withInIterationOnly">
        <div class="row items-center justify-end">
          <q-btn
            v-close-popup
            label="Ok"
            @click="updateDueDate(dueDate)"
            color="primary"
            flat
          />
        </div>
      </q-date>
    </q-popup-proxy>
    <q-tooltip>Due Date</q-tooltip>
  </q-chip>
</template>
<script lang="ts" setup>
import { date, useQuasar } from 'quasar';
import { DiscussionItem } from 'src/entities';
import { useIterationStore } from 'src/stores/iterations.store';
import { TheWorkflows } from 'src/workflows/the-workflows';
import { ref } from 'vue';
const $q = useQuasar();
const iterationStore = useIterationStore();
const props = defineProps<{
  task: DiscussionItem;
}>();
const dueDate = ref(props.task.dueDate || '');
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
function updateDueDate(d: string) {
  TheWorkflows.emit({
    type: 'updateDiscussionFields',
    arg: {
      payload: {
        ...props.task,
        dueDate: d,
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
