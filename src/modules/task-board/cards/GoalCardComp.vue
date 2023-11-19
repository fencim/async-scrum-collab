<script lang="ts" setup>
import BaseCard from 'src/components/BaseCardComponent.vue';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import CommonCardAction from './CommonCardActionComp.vue';
import { DiscussionItem, IGoal } from 'src/entities';
import { defineProps, PropType } from 'vue';
import { getProfiles } from './card-helpers';
defineProps({
  task: {
    required: true,
    type: Object as PropType<IGoal>,
  },
  mini: Boolean,
  maxed: Boolean,
});
function iterationKey(task: DiscussionItem) {
  return typeof task.iteration == 'object'
    ? task.iteration.key
    : task.iteration;
}
</script>
<template>
  <base-card :maxed="maxed" :mini="mini" :task="task">
    <template #title>
      {{ task.description }}
    </template>
    <template #side>
      <q-chip dense color="primary">{{ task.priority || 'P1' }}</q-chip>
      <q-chip dense color="secondary">{{ task.dueDate || 'ND' }}</q-chip>
    </template>
    <template #details> </template>
    <template #footer>
      <recent-active-members :profiles="getProfiles(task.assignees)" />
      <q-badge v-if="mini && typeof task.iteration == 'object'" dense>{{
        task.iteration.name || task.iteration
      }}</q-badge>
    </template>
    <template #bottom>
      <q-linear-progress :value="0.5" />
    </template>
    <template #dropdown>
      <div class="row bg-transaparent no-shadow">
        <common-card-action :task="task" />
      </div>
    </template>
  </base-card>
</template>
