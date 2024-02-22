<script setup lang="ts">
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { DiscussionItem } from 'src/entities';
import { PropType, ref } from 'vue';
import { getProfiles } from './card-helpers';
import { date } from 'quasar';
import DueDateChipComp from './DueDateChipComp.vue';

const props = defineProps({
  task: {
    required: true,
    type: Object as PropType<DiscussionItem>,
  },
  mini: Boolean,
  maxed: Boolean,
  noAction: Boolean,
});
function withInIterationOnly(d: string) {
  const iteration = props.task.iteration;
  if (typeof iteration != 'object') return true;
  const start = date.formatDate(iteration.start, 'YYYY/MM/DD');
  const end = date.formatDate(iteration.end, 'YYYY/MM/DD');
  return (!iteration.start || d >= start) && (!iteration.end || d <= end);
}
</script>
<template>
  <recent-active-members sizes="xs" :profiles="getProfiles(task.assignees)" />
  <q-space />
  <div>
    <q-badge class="q-mr-xs" dense color="primary">{{
      task.priority || 'P1'
    }}</q-badge>
    <due-date-chip-comp :task="task" />
  </div>
</template>
