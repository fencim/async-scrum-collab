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
      <div>
        <q-badge v-if="mini && typeof task.iteration == 'object'" dense>{{
          task.iteration.name || task.iteration
        }}</q-badge>
      </div>
    </template>
    <template #footer>
      <recent-active-members
        sizes="xs"
        :profiles="getProfiles(task.assignees)"
      />
      <q-space />
      <div>
        <q-badge class="q-mr-xs" dense color="primary">{{
          task.priority || 'P1'
        }}</q-badge>
        <q-badge dense :color="task.dueDate ? 'secondary' : 'negative'">{{
          task.dueDate || 'ND'
        }}</q-badge>
      </div>
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
