<script setup lang="ts">
import ProductBacklog from './ProductBacklogComponent.vue';
import IterationTaskBoardDesktop from './IterationTaskBoardDesktopComponent.vue';
import IterationTaskBoardMobile from './IterationTaskBoardMobileComponent.vue';

import { useIterationStore } from 'src/stores/iterations.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useActiveStore } from 'src/stores/active.store';

import { ref, onMounted } from 'vue';
import {
  DiscussionItem,
  IIteration,
  ISprintBoardColumn,
  IStory,
} from 'src/entities';
import { useRoute, useRouter } from 'vue-router';
import CardDetails from 'src/components/CardDetails.vue';
import DiscussionForm from 'src/components/DiscussionForm.vue';
import { convoBus } from '../ceremony/convo-bus';
const tab = ref('all');
const selectedItem = ref<undefined | DiscussionItem>();
const splitSection = ref(30);
const iterationStore = useIterationStore();
const discussionStore = useDiscussionStore();
const activeStore = useActiveStore();
const showItemBottomSheet = ref(false);
onMounted(async () => {
  const project = activeStore.activeProject;
  if (project) {
    discussionStore.ofProject(project.key);
  }
  const route = useRoute();
  if (route.params.iteration && typeof route.params.iteration == 'string') {
    tab.value = route.params.iteration;
  } else if (activeStore.activeProject && iterationStore.iterations.length) {
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
  if (route.params.item && selectedItem.value?.key !== route.params.item) {
    const item = await discussionStore.withKey(route.params.item as string);
    if (item) {
      viewTaskDetails(item);
    }
  }
});
async function taskMoved(
  issue: DiscussionItem,
  column?: ISprintBoardColumn,
  iterationKey?: string
) {
  if (column) {
    issue.status = column.key;
  }
  if (iterationKey) {
    issue.iteration = iterationKey;
    tab.value = iterationKey;
  }
  await discussionStore.saveDiscussion(issue);
}
function viewTaskDetails(issue: DiscussionItem) {
  selectedItem.value = issue;
  showItemBottomSheet.value = true;
  const route = useRoute();
  if (route.params.item !== issue.key) {
    useRouter().replace({
      name: 'board',
      params: {
        ...route.params,
        item: issue.key,
      },
    });
  }
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
        <product-backlog @task-on-view="viewTaskDetails" />
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
                v-if="
                  typeof activeStore.activeProject?.boardColumns == 'object'
                "
              >
                <div
                  class="kanban-column col column full-height"
                  v-for="(column, columnIndex) in discussionStore.getTaskBoard(
                    activeStore.activeProject?.boardColumns,
                    i.key
                  )"
                  :key="columnIndex"
                >
                  <iteration-task-board-desktop
                    :column="column"
                    :iteration="i"
                    @task-added="taskMoved"
                    @task-on-view="viewTaskDetails"
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
          <product-backlog @task-on-view="viewTaskDetails" />
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
              @task-on-view="viewTaskDetails"
            />
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
  <q-dialog v-model="showItemBottomSheet" :position="'bottom'">
    <card-details v-if="selectedItem" :item="selectedItem" />
  </q-dialog>
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
