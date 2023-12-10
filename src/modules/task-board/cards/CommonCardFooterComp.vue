<script setup lang="ts">
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { DiscussionItem } from 'src/entities';
import { PropType, ref } from 'vue';
import { getProfiles } from './card-helpers';
import { date } from 'quasar';
import { useDiscussionStore } from 'src/stores/discussions.store';

const props = defineProps({
  task: {
    required: true,
    type: Object as PropType<DiscussionItem>,
  },
  mini: Boolean,
  maxed: Boolean,
  noAction: Boolean,
});
const dueDate = ref(props.task.dueDate || '');
function withInIterationOnly(d: string) {
  const iteration = props.task.iteration;
  if (typeof iteration != 'object') return true;
  const start = date.formatDate(iteration.start, 'YYYY/MM/DD');
  const end = date.formatDate(iteration.end, 'YYYY/MM/DD');
  return (!iteration.start || d >= start) && (!iteration.end || d <= end);
}
function updateDueDate(d: string) {
  return useDiscussionStore().saveDiscussion({
    ...props.task,
    dueDate: d,
  });
}
function formatDate(d: string) {
  return d && date.formatDate(d, 'MMM DD');
}
</script>
<template>
  <recent-active-members sizes="xs" :profiles="getProfiles(task.assignees)" />
  <q-space />
  <div>
    <q-badge class="q-mr-xs" dense color="primary">{{
      task.priority || 'P1'
    }}</q-badge>
    <q-chip clickable dense :color="task.dueDate ? 'secondary' : 'negative'"
      >{{ (task.dueDate && formatDate(task.dueDate)) || 'ND' }}
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
    </q-chip>
  </div>
</template>
