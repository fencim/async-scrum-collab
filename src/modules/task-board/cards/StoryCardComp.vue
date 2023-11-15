<script lang="ts" setup>
import BaseCard from 'src/components/BaseCardComponent.vue';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { IStory } from 'src/entities';
import { defineProps, PropType, ref } from 'vue';
import { getProfiles } from './card-helpers';
const props = defineProps({
  task: {
    required: true,
    type: Object as PropType<IStory>,
  },
  mini: Boolean,
  maxed: Boolean,
});
const showDetails = ref(false);
</script>
<template>
  <base-card :maxed="maxed" :mini="mini" :task="task">
    <template #title>
      {{
        `As ${props.task.targetUser}, I want to ${props.task.subject}, so that ${props.task.purpose}`
      }}
    </template>
    <template #side>
      <q-chip dense color="primary">{{ task.priority || 'P1' }}</q-chip>
      <q-chip dense color="secondary">{{ task.dueDate || 'No Due' }}</q-chip>
    </template>
    <template #details>
      <q-list
        ><q-item
          v-for="(item, index) in props.task.acceptanceCriteria"
          :key="index"
        >
          <q-item-section>
            <q-item-label> Given {{ item.given }} </q-item-label>
            <q-item-label caption> When {{ item.when }} </q-item-label>
            <q-item-label> Then {{ item.then }} </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </template>
    <template #footer>
      <recent-active-members :profiles="getProfiles(task.assignees)" />
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
