<script setup lang="ts">
import draggable from 'vuedraggable';
import { PropType, ref, computed } from 'vue';
import { getComponent } from './card-components';
import {
  DiscussionItem,
  IIteration,
  ISprintBoardColumn,
  PlanningItem,
} from 'src/entities';
import { TheDialogs } from 'src/dialogs/the-dialogs';
import { useDiscussionStore } from 'src/stores/discussions.store';
const props = defineProps({
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
const keyword = ref('');
const filteredList = computed(() => {
  if (!keyword.value) return props.column.tasks;
  const discussionStore = useDiscussionStore();
  return props.column.tasks.filter((t) =>
    new RegExp(keyword.value, 'i').test(discussionStore.describeDiscussion(t))
  );
});
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
    :list="filteredList"
    group="tasks"
    item-key="key"
    @change="(e) => changeOnColumn(column, e, iteration.key)"
  >
    <template #header>
      <div class="row">
        <q-btn
          class="col-12 q-mx-sm"
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
        <q-input
          class="col-12 q-mx-sm"
          dense
          label="Keyword"
          v-model="keyword"
        />
      </div>
    </template>
    <template #item="{ element }">
      <q-card
        class="list-group-item q-ma-sm q-pa-sm board-card"
        :class="element.type + '-card'"
      >
        <component :is="getComponent(element)" :task="element" mini />
      </q-card>
    </template>
  </draggable>
</template>
