<script setup lang="ts">
import draggable from 'vuedraggable';
import ProductBacklog from './ProductBacklogComponent.vue';

import { useIterationStore } from 'src/stores/iterations.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useActiveStore } from 'src/stores/active.store';

import { ref, onMounted } from 'vue';
// import { dummyData } from './dummy-data';
// import { ISprintBoardColumn } from 'src/entities';
import { getComponent } from './card-components';
import { useQuasar } from 'quasar';
import { ISprintBoardColumn, PlanningItem } from 'src/entities';
const tab = ref('all');
const iterationStore = useIterationStore();
const discussionStore = useDiscussionStore();
const activeStore = useActiveStore();

onMounted(async () => {
  const project = activeStore.activeProject;
  if (project) {
    discussionStore.ofProject(project.key);
  }
  if (activeStore.activeProject && iterationStore.iterations.length) {
    tab.value = iterationStore.iterations[0].key;
  }
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
    const issue = { ...change.added.element };
    issue.status = column.key;
    issue.iteration = iterationKey;
    await discussionStore.saveDiscussion(issue);
  }
}
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
        <div class="text-h6 q-px-sm">Product Backlog</div>
        <product-backlog />
      </div>
      <q-tab-panels v-model="tab" class="col">
        <q-tab-panel name="all" v-if="$q.screen.lt.md">
          <product-backlog />
        </q-tab-panel>
        <q-tab-pannel
          v-for="i in iterationStore.iterations"
          :key="i.key"
          :name="i.key"
        >
          <div class="text-h6 q-px-sm">{{ i.name }}</div>
          <div
            class="kanban-board row"
            v-if="typeof activeStore.activeProject?.boardColumns == 'object'"
          >
            <div
              class="kanban-column col column"
              v-for="(column, columnIndex) in discussionStore.getTaskBoard(
                activeStore.activeProject?.boardColumns,
                i.key
              )"
              :key="columnIndex"
            >
              <draggable
                class="col kanban-task-list dragArea list-group full-height"
                :list="column.tasks"
                group="tasks"
                item-key="key"
                @change="(e) => changeOnColumn(column, e, i.key)"
              >
                <template #header>
                  <div class="text-h6 q-pa-sm">{{ column.name }}</div>
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
