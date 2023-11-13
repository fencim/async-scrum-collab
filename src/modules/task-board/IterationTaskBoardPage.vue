<script setup lang="ts">
import cards from './cards';
import draggable from 'vuedraggable';

import { useIterationStore } from 'src/stores/iterations.store';
import { ref } from 'vue';
import { dummyData } from './dummy-data';
import { PlanningItem } from 'src/entities';
const tab = ref('all');
type Component = any;
const componentMap: Record<PlanningItem['type'], string | Component> = {
  goal: cards.GoalCard,
  objective: cards.ObjectiveCard,
  story: cards.StoryCard,
  task: cards.TechnicalCard,
};
function getComponent(item: PlanningItem) {
  if (typeof componentMap[item.type] == 'string') {
    return componentMap[item.type];
  } else {
    return componentMap[item.type];
  }
}
const iterationStore = useIterationStore();
const columns = ref(dummyData);
</script>
<template>
  <q-page class="justify-evenly q-pa-sm">
    <q-tabs v-model="tab" inline-label dense class="text-teal">
      <q-tab name="all" icon="dashboard" label="All" />
      <q-tab
        v-for="i in iterationStore.iterations"
        :key="i.key"
        :name="i.key"
        icon="splitscreen"
        :label="i.name"
      />
    </q-tabs>
    <q-separator />
    <q-tab-panels v-model="tab">
      <q-tab-panel name="all">
        <div class="text-h6">All</div>
      </q-tab-panel>
      <q-tab-pannel
        v-for="i in iterationStore.iterations"
        :key="i.key"
        :name="i.key"
      >
        <div class="text-h6">{{ i.name }}</div>
        <div class="kanban-board row">
          <div
            class="kanban-column col-4 column"
            v-for="(column, columnIndex) in columns"
            :key="columnIndex"
          >
            <draggable
              class="col kanban-task-list dragArea list-group"
              :list="column.tasks"
              group="tasks"
              item-key="key"
            >
              <template #header>
                <h6>{{ column.name }}</h6>
              </template>
              <template #item="{ element }">
                <q-card
                  class="list-group-item q-ma-sm q-pa-sm board-card"
                  :class="element.type + '-card'"
                >
                  <component :is="getComponent(element)" :task="element" />
                  <q-btn
                    class="float-right vertical-bottom"
                    size="xs"
                    icon="circle"
                    dense
                    flat
                  >
                    <q-tooltip>{{ element.type }}</q-tooltip>
                  </q-btn>
                </q-card>
              </template>
            </draggable>
          </div>
        </div>
      </q-tab-pannel>
    </q-tab-panels>
  </q-page>
</template>
<style lang="sass">
.board-card
  border-left: 5px solid
.goal-card
  border-color: blue
.objective-card
  border-color: purple
.story-card
  border-color: green
</style>
