<script lang="ts" setup>
import BaseCard from 'src/components/BaseCardComponent.vue';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import CommonCardAction from './CommonCardActionComp.vue';
import {
  DiscussionItem,
  IObjective,
  ISprintBoardColumn,
  IStory,
} from 'src/entities';
import { PropType } from 'vue';
import { getProfiles } from './card-helpers';

defineEmits<{
  (
    e: 'taskMoved',
    issue: DiscussionItem,
    column?: ISprintBoardColumn,
    iterationKey?: string
  ): void;
  (e: 'taskOnView', issue: DiscussionItem): void;
}>();

defineProps({
  task: {
    required: true,
    type: Object as PropType<IObjective>,
  },
  mini: Boolean,
  maxed: Boolean,
  noAction: Boolean,
});
</script>
<template>
  <base-card
    @task-on-view="(issue) => $emit('taskOnView', issue)"
    :maxed="maxed"
    :mini="mini"
    :no-action="noAction"
    :task="task"
  >
    <template #title>
      {{ task.description }}
    </template>
    <template #side v-if="mini && typeof task.iteration == 'object'">
      <div>
        <q-badge dense>{{ task.iteration.name || task.iteration }}</q-badge>
      </div>
    </template>
    <template #details>
      <div>
        {{ task.specifics }}, {{ task.enables }}, {{ task.mesures }},
        {{ task.dueDate }}
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
