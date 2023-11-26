<script lang="ts" setup>
import BaseCard from 'src/components/BaseCardComponent.vue';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { DiscussionItem, ISprintBoardColumn, IStory } from 'src/entities';
import { defineProps, PropType } from 'vue';
import { getProfiles } from './card-helpers';
import CommonCardAction from './CommonCardActionComp.vue';
defineEmits<{
  (
    e: 'taskMoved',
    issue: DiscussionItem,
    column?: ISprintBoardColumn,
    iterationKey?: string
  ): void;
}>();

const props = defineProps({
  task: {
    required: true,
    type: Object as PropType<IStory>,
  },
  mini: Boolean,
  maxed: Boolean,
  noAction: Boolean,
});
</script>
<template>
  <base-card :maxed="maxed" :mini="mini" :no-action="noAction" :task="task">
    <template #title>
      <div v-if="!mini">
        <div>
          As
          <span class="text-accent">{{ props.task.targetUser }}</span>
        </div>
        <div>
          I want to <span class="text-secondary">{{ props.task.subject }}</span>
        </div>
        <div>
          So that <span class="text-primary">{{ props.task.purpose }}</span>
        </div>
      </div>
      <div v-else>{{ task.subject }}</div>
    </template>
    <template #side>
      <div>
        <q-badge v-if="mini && typeof task.iteration == 'object'" dense>{{
          task.iteration.name || task.iteration
        }}</q-badge>
        <q-space />
        <q-badge v-if="task.complexity" class="text-h6 on-right">{{
          task.complexity
        }}</q-badge>
      </div>
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
      <q-linear-progress :value="task.progress || 0" />
    </template>
    <template #dropdown>
      <div class="row bg-transaparent no-shadow">
        <common-card-action
          :task="task"
          @task-moved="
            (issue, col, iteration) => $emit('taskMoved', issue, col, iteration)
          "
        />
      </div>
    </template>
  </base-card>
</template>
