<script lang="ts" setup>
import BaseCard from 'src/components/BaseCardComponent.vue';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { IGoal } from 'src/entities';
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
</script>
<template>
  <base-card :maxed="maxed" :mini="mini" :task="task">
    <template #title>
      {{ task.description }}
    </template>
    <template #side>
      <q-chip dense color="primary">{{ task.priority || 'P1' }}</q-chip>
      <q-chip dense color="secondary">{{ task.dueDate || 'No Due' }}</q-chip>
    </template>
    <template #details>
      <recent-active-members :profiles="getProfiles(task.assignees)" />
    </template>
    <template #footer>
      <q-badge v-if="typeof task.iteration == 'object'" dense>{{
        task.iteration.name || ''
      }}</q-badge>
    </template>
    <template #bottom>
      <q-linear-progress :value="0.5" />
    </template>
    <template #dropdown>
      <div class="row bg-transaparent no-shadow">
        <q-btn round icon="person" size="sm"
          ><q-tooltip>Assign</q-tooltip></q-btn
        >
        <q-btn round icon="edit" size="sm"><q-tooltip>Edit</q-tooltip></q-btn>
      </div>
    </template>
  </base-card>
</template>
