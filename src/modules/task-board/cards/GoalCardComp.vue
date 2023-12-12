<script lang="ts" setup>
import BaseCard from 'src/components/BaseCardComponent.vue';
import CommonCardAction from './CommonCardActionComp.vue';
import { DiscussionItem, IGoal, ISprintBoardColumn } from 'src/entities';
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
const props = defineProps({
  task: {
    required: true,
    type: Object as PropType<IGoal>,
  },
  mini: Boolean,
  maxed: Boolean,
  noAction: Boolean,
  headerOnly: Boolean,
});
</script>
<template>
  <base-card
    :header-only="headerOnly"
    :maxed="maxed"
    :mini="mini"
    :no-action="noAction"
    :task="task"
  >
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
