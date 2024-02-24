<script lang="ts" setup>
import BaseCard from 'src/components/BaseCardComponent.vue';
import CommonCardAction from './CommonCardActionComp.vue';

import {
  DiscussionItem,
  ISprintBoardColumn,
  TechnicalTask,
} from 'src/entities';
import { PropType } from 'vue';
import CommonCardFooterComp from './CommonCardFooterComp.vue';
defineEmits<{
  (
    e: 'taskMoved',
    issue: DiscussionItem,
    column?: ISprintBoardColumn,
    iterationKey?: string
  ): void;
}>();

defineProps({
  task: {
    required: true,
    type: Object as PropType<TechnicalTask>,
  },
  mini: Boolean,
  maxed: Boolean,
  noAction: Boolean,
  headerOnly: Boolean,
  chipOnly: Boolean,
});
</script>
<template>
  <base-card
    :header-only="headerOnly"
    :maxed="maxed"
    :mini="mini"
    :no-action="noAction"
    :task="task"
    :chip-only="chipOnly"
  >
    <template #title>
      {{ task.description }}
    </template>
    <template #side> </template>
    <template #details>
      {{ task.info }}
    </template>
    <template #footer>
      <common-card-footer-comp :task="task" :maxed="maxed" :mini="mini" />
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
