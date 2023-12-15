<script setup lang="ts">
import draggable from 'vuedraggable';
import { PropType, defineEmits } from 'vue';
import { getComponent } from './card-components';
import {
  DiscussionItem,
  IIteration,
  ISprintBoardColumn,
  PlanningItem,
} from 'src/entities';
import { convoBus } from '../ceremony/convo-bus';
import { TheDialogs } from 'src/dialogs/the-dialogs';
defineProps({
  column: {
    required: true,
    type: Object as PropType<ISprintBoardColumn>,
  },
  iteration: {
    required: true,
    type: Object as PropType<IIteration>,
  },
});

const emit = defineEmits<{
  (
    e: 'taskAdded',
    issue: DiscussionItem,
    column: ISprintBoardColumn,
    iterationKey: string
  ): void;
}>();
async function changeOnColumn(
  column: ISprintBoardColumn,
  change: {
    added?: { newIndex: number; element: PlanningItem };
    removed: { oldIndex: number; element: PlanningItem };
    moved: { newIndex: number; oldIndex: number; element: PlanningItem };
  },
  iterationKey: string
) {
  if (change.added) {
    const issue = { ...change.added.element } as DiscussionItem;
    emit('taskAdded', issue, column, iterationKey);
  }
}
</script>
<template>
  <draggable
    class="col kanban-task-list dragArea list-group full-height"
    :list="column.tasks"
    group="tasks"
    item-key="key"
    @change="(e) => changeOnColumn(column, e, iteration.key)"
  >
    <template #header>
      <div class="row">
        <q-btn
          class="col q-ma-sm"
          :icon="column.icon"
          :color="column.color || 'accent'"
          :style="{ 'background-color': column.color }"
          dense
          @click="
            TheDialogs.emit({
              type: 'newTask',
              arg: {
                status: column.key,
              },
            })
          "
          >{{ column.name }}</q-btn
        >
      </div>
    </template>
    <template #item="{ element }">
      <q-card
        class="list-group-item q-ma-sm q-pa-sm board-card"
        :class="element.type + '-card'"
      >
        <component :is="getComponent(element)" :task="element" />
      </q-card>
    </template>
  </draggable>
</template>
