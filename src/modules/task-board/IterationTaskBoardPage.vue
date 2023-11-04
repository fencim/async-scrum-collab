<script setup lang="ts">
import { useIterationStore } from 'src/stores/iterations.store';
import draggable from 'vuedraggable';
import { ref } from 'vue';
import { PlanningItem } from 'src/entities';
const tab = ref('all');

const iterationStore = useIterationStore();
const columns = ref<{ name: string; tasks: PlanningItem[] }[]>([
  {
    name: 'To Do',
    tasks: [
      {
        key: 'test',
        type: 'story',
        acceptanceCriteria: [],
        awareness: {},
        ceremonyKey: '',
        projectKey: '',
        tasks: [],
        subject: 'do this',
        purpose: 'test',
        targetUser: 'user',
      },
    ],
  },
  {
    name: 'In Progress',
    tasks: [
      {
        key: 'test2',
        type: 'goal',
        awareness: {},
        ceremonyKey: '',
        description: 'Testing',
        projectKey: 'PR',
      },
    ],
  },
  { name: 'Done', tasks: [] },
]);
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
                  {{ element.type }}
                  {{ element.key }}
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
.story-card
  border-color: green
</style>
