<script setup lang="ts">
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { DiscussionItem } from 'src/entities';
import { PropType } from 'vue';
import { getProfiles } from './card-helpers';
import DueDateChipComp from './DueDateChipComp.vue';

defineProps({
  task: {
    required: true,
    type: Object as PropType<DiscussionItem>,
  },
  mini: Boolean,
  maxed: Boolean,
  noAction: Boolean,
});
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
