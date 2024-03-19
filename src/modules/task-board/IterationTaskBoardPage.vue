<script setup lang="ts">
import ProductBacklog from './ProductBacklogComponent.vue';
import IterationTaskBoardDesktop from './IterationTaskBoardDesktopComponent.vue';
import IterationTaskBoardMobile from './IterationTaskBoardMobileComponent.vue';

import { useIterationStore } from 'src/stores/iterations.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useActiveStore } from 'src/stores/active.store';

import { ref, onMounted, computed } from 'vue';
import { DiscussionItem, ISprintBoardColumn } from 'src/entities';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { TheWorkflows } from 'src/workflows/the-workflows';
import { entityKey } from 'src/entities/base.entity';
import { TaskActionError } from 'src/workflows/discussion/definition';

const $q = useQuasar();
const iterationStore = useIterationStore();
const discussionStore = useDiscussionStore();
const activeStore = useActiveStore();

const tab = ref('all');
const splitSection = ref(20);

onMounted(async () => {
  const route = useRoute();
  if (route.params.iteration && typeof route.params.iteration == 'string') {
    tab.value = route.params.iteration;
  } else if (activeStore.activeProject && iterationStore.iterations.length) {
    const project = activeStore.activeProject;
    tab.value = iterationStore.iterations[0].key;
    const router = useRouter();
    router.replace({
      name: 'board',
      params: {
        project: project?.key,
        iteration: iterationStore.iterations[0].key,
      },
    });
  }
});
const boardColumns = computed(() => {
  return activeStore.activeProject?.boardColumns || [];
});

async function taskMoved(
  issue: DiscussionItem,
  column?: ISprintBoardColumn,
  iterationKey?: string
) {
  TheWorkflows.emit({
    type: 'moveIssue',
    arg: {
      item: issue,
      column,
      iterationKey,
      done: (updated) => {
        if (updated.iteration && entityKey(updated.iteration)) {
          tab.value = entityKey(updated.iteration);
        }
      },
      error(error) {
        switch (error) {
          case TaskActionError.notMoveable:
            $q.notify({
              icon: 'error',
              message:
                'Cannot move iteration goal of objective from other iteration',
              color: 'negative',
            });
            break;
          case TaskActionError.alreadyClosed:
            $q.notify({
              icon: 'error',
              message: 'Cannot move done issue from other iteration',
              caption: 'Re-open it before moving it',
              color: 'negative',
            });
            break;
          case TaskActionError.notReady:
            $q.notify({
              icon: 'error',
              message:
                'Cannot grab issue until readiness reached' +
                ` ${(
                  (activeStore.activeProject?.discussionReadiness || 0) * 100
                ).toFixed()}%`,

              caption: 'Discuss the issue with the team',
              color: 'negative',
            });
            break;
          default:
            break;
        }
      },
    },
  });
}
</script>
<template>
  <q-page class="justify-evenly q-pa-sm">
    <q-tabs v-model="tab" inline-label dense class="text-teal">
      <q-route-tab
        name="all"
        :to="{
          name: 'board',
          params: {
            project: activeStore.activeProject?.key,
            iteration: 'all',
          },
        }"
        icon="dashboard"
        label="Product"
        v-if="$q.screen.lt.md"
      />
      <q-route-tab
        v-for="i in iterationStore.iterations"
        :key="i.key"
        :name="i.key"
        icon="splitscreen"
        :label="i.name"
        :to="{
          name: 'board',
          params: {
            project: i.projectKey,
            iteration: i.key,
          },
        }"
      />
    </q-tabs>
    <q-separator />
    <q-splitter v-model="splitSection" v-if="!$q.screen.lt.md">
      <template #before>
        <div class="text-h6 q-px-sm">Product Backlog</div>
        <product-backlog @task-moved="taskMoved" />
      </template>
      <template #after>
        <div class="row" :style="'min-height: ' + $q.screen.sizes.sm + 'px'">
          <q-tab-panels v-model="tab" class="col">
            <q-tab-panel
              v-for="i in iterationStore.iterations"
              :key="i.key"
              :name="i.key"
            >
              <div
                class="kanban-board row full-height"
                v-if="boardColumns.length"
              >
                <div
                  class="kanban-column col column full-height"
                  v-for="(column, columnIndex) in discussionStore.getTaskBoard(
                    boardColumns,
                    i.key
                  )"
                  :key="columnIndex"
                >
                  <iteration-task-board-desktop
                    :column="column"
                    :iteration="i"
                    @task-added="taskMoved"
                  />
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </template>
    </q-splitter>
    <div v-else>
      <q-tab-panels v-model="tab" class="col">
        <q-tab-panel name="all">
          <product-backlog @task-moved="taskMoved" />
        </q-tab-panel>
        <q-tab-panel
          v-for="i in iterationStore.iterations"
          :key="i.key"
          :name="i.key"
        >
          <div
            v-if="typeof activeStore.activeProject?.boardColumns == 'object'"
          >
            <iteration-task-board-mobile
              :columns="
                discussionStore.getTaskBoard(
                  activeStore.activeProject?.boardColumns,
                  i.key
                )
              "
              :iteration="i"
              @task-moved="taskMoved"
            />
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>
<style lang="sass">
.board-card
  border: 1px solid black
  border-left: 5px solid
.goal-card
  border-left-color: blue
.objective-card
  border-left-color: purple
.story-card
  border-left-color: green
</style>
