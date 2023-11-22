<script setup lang="ts">
import draggable from 'vuedraggable';
import { defineProps, PropType, defineEmits, ref } from 'vue';
import { getComponent } from './card-components';
import {
  DiscussionItem,
  IIteration,
  ISprintBoardColumn,
  PlanningItem,
} from 'src/entities';
const props = defineProps({
  columns: {
    required: true,
    type: Object as PropType<ISprintBoardColumn[]>,
  },
  iteration: {
    required: true,
    type: Object as PropType<IIteration>,
  },
});
const emit = defineEmits<{
  (
    e: 'taskMoved',
    issue: DiscussionItem,
    column?: ISprintBoardColumn,
    iterationKey?: string
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
  if (change.moved) {
    //TODO: Change Order
  }
}

const tab = ref(props.columns[0]?.key || 'to_do');
function leftTabs() {
  const columns = [...props.columns];
  const tabIndex = columns.findIndex((c) => c.key == tab.value);
  if (tabIndex > 0) {
    return columns.splice(0, tabIndex).reverse();
  } else {
    return [];
  }
}
function rightTabs() {
  const columns = [...props.columns];
  const tabIndex = columns.findIndex((c) => c.key == tab.value);
  if (tabIndex > 0) {
    return columns.splice(tabIndex + 1);
  } else {
    return columns.splice(1);
  }
}
function taskMoved(
  issue: DiscussionItem,
  column?: ISprintBoardColumn,
  iterationKey?: string
) {
  emit('taskMoved', issue, column, iterationKey);
  if (column) {
    tab.value = column.key;
  }
}
</script>
<template>
  <div class="row full-height">
    <transition
      name="slide"
      :mode="'in-out'"
      enter-active-class="animated slide-right"
      leave-active-class="animated slide-left"
    >
      <div v-if="leftTabs().length" style="min-width: 100px; max-width: 100px">
        <q-tabs vertical v-model="tab" dense>
          <q-tab
            v-for="column in leftTabs()"
            :name="column.key"
            :key="column.key"
            :label="column.name"
            :icon="column.icon"
          >
            <q-badge :align="'top'" floating>{{ column.tasks.length }}</q-badge>
          </q-tab>
        </q-tabs>
      </div>
    </transition>
    <div class="col">
      <q-tab-panels v-model="tab" :transition-duration="500" animated>
        <q-tab-panel v-for="col in columns" :key="col.key" :name="col.key">
          <draggable
            class="kanban-task-list dragArea list-group full-height"
            :list="col.tasks || []"
            group="tasks"
            item-key="key"
            @change="(e) => changeOnColumn(col, e, iteration.key)"
          >
            <template #header>
              <div class="row">
                <q-btn
                  class="col q-ma-sm"
                  :icon="col.icon"
                  :color="col.color || 'accent'"
                  dense
                  >{{ col.name }}</q-btn
                >
              </div>
            </template>
            <template #item="{ element }">
              <q-card
                class="list-group-item q-ma-sm q-pa-sm board-card"
                :class="element.type + '-card'"
              >
                <component
                  :is="getComponent(element)"
                  :task="element"
                  @task-moved="
            (issue:DiscussionItem, col?:ISprintBoardColumn, iteration?:string) =>
            taskMoved(issue, col, iteration)
          "
                />
              </q-card>
            </template>
          </draggable>
        </q-tab-panel>
      </q-tab-panels>
    </div>
    <div style="min-width: 100px; max-width: 100px">
      <q-tabs vertical v-model="tab" dense>
        <q-tab
          v-for="column in rightTabs()"
          :name="column.key"
          :key="column.key"
          :label="column.name"
          :icon="column.icon"
        >
          <q-badge floating>{{ column.tasks.length }}</q-badge>
        </q-tab>
      </q-tabs>
    </div>
  </div>
</template>
