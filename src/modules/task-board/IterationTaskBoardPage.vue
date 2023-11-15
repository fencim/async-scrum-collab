<script setup lang="ts">
import draggable from 'vuedraggable';
import ProductBacklog from './ProductBacklogComponent.vue';

import { useIterationStore } from 'src/stores/iterations.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useActiveStore } from 'src/stores/active.store';

import { ref, onMounted } from 'vue';
import { dummyData } from './dummy-data';
import { ISprintBoardColumn } from 'src/entities';
import { getComponent } from './card-components';
import { useQuasar } from 'quasar';
const tab = ref('all');
const iterationStore = useIterationStore();
const discussionStore = useDiscussionStore();
const activeStore = useActiveStore();
const columns = ref<ISprintBoardColumn[]>([...dummyData]);

onMounted(async () => {
  const project = activeStore.activeProject;
  if (project) {
    discussionStore.ofProject(project.key);
  }
  const q = useQuasar();
  if (!q.screen.lt.md && activeStore.activeProject) {
    tab.value;
  }
});
</script>
<template>
  <q-page class="justify-evenly q-pa-sm">
    <q-tabs v-model="tab" inline-label dense class="text-teal">
      <q-tab
        name="all"
        icon="dashboard"
        label="Product"
        v-if="$q.screen.lt.md"
      />
      <q-tab
        v-for="i in iterationStore.iterations"
        :key="i.key"
        :name="i.key"
        icon="splitscreen"
        :label="i.name"
      />
    </q-tabs>
    <q-separator />
    <div class="row">
      <div v-if="!$q.screen.lt.md" class="col-4">
        <div class="text-h6">Product Backlog</div>
        <product-backlog />
      </div>
      <q-tab-panels v-model="tab" class="col">
        <q-tab-panel name="all" v-if="$q.screen.lt.md">
          <div class="text-h6">All</div>
          <product-backlog />
        </q-tab-panel>
        <q-tab-pannel
          v-for="i in iterationStore.iterations"
          :key="i.key"
          :name="i.key"
        >
          <div class="text-h6">{{ i.name }}</div>
          <div class="kanban-board row">
            <div
              class="kanban-column col column"
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
                  </q-card>
                </template>
              </draggable>
            </div>
          </div>
        </q-tab-pannel>
      </q-tab-panels>
    </div>
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
