<script setup lang="ts">
import { useIterationStore } from 'src/stores/iterations.store';
import draggable from 'vuedraggable';
import { ref } from 'vue';
const tab = ref('all');
const search = ref('');
const add_new = ref(false);
const drag = ref(false);
const dragOptions = ref({
  animation: 200,
  //group: 'description',
  disabled: false,
  ghostClass: 'ghost',
});
const iterationStore = useIterationStore();
const task_index = ref({
  to_do_index: null,
  in_progress_index: null,
  test_index: null,
  done_index: null,
});
// const task_item = ref({
//   task_title: 'Task Name',
//   task_type: 'feature',
//   id: null,
// });
const task_to_do = ref([
  {
    task_title: 'Develop the add new call feature',
    task_type: 'feature',
    id: 1,
    tags: [
      { name: 'css', color: 'yellow' },
      { name: 'html', color: 'pink' },
    ],
  },
  {
    task_title: 'Improvements',
    task_type: 'enhancement',
    id: 2,
    tags: [
      { name: 'js', color: 'orange' },
      { name: 'html', color: 'pink' },
      { name: 'api', color: 'teal' },
    ],
  },
  {
    task_title: 'Fix the issue in send email',
    task_type: 'bug',
    id: 3,
    tags: [{ name: 'api', color: 'teal' }],
  },
  {
    task_title: 'Remove static handling',
    task_type: 'feature',
    id: 4,
    tags: [
      { name: 'js', color: 'orange' },
      { name: 'api', color: 'teal' },
    ],
  },
]);
const task_in_progress = ref([
  {
    task_title: 'Fix upgrade issues',
    task_type: 'bug',
    id: 5,
    tags: [
      { name: 'api', color: 'teal' },
      { name: 'html', color: 'pink' },
    ],
  },
  {
    task_title: 'Convert list to grid',
    task_type: 'feature',
    id: 6,
    tags: [
      { name: 'html', color: 'pink' },
      { name: 'api', color: 'teal' },
      { name: 'css', color: 'yellow' },
    ],
  },
  {
    task_title: 'Update back-end API',
    task_type: 'feature',
    id: 7,
    tags: [
      { name: 'css', color: 'yellow' },
      { name: 'api', color: 'teal' },
    ],
  },
]);
const task_test = ref([
  {
    task_title: 'Test project upgrade version',
    task_type: 'feature',
    id: 5,
    tags: [{ name: 'api', color: 'teal' }],
  },
  {
    task_title: 'The edit blog functionalities',
    task_type: 'feature',
    id: 6,
    tags: [
      { name: 'html', color: 'pink' },
      { name: 'api', color: 'teal' },
      { name: 'js', color: 'orange' },
    ],
  },
  {
    task_title: 'Back-end API enhancements',
    task_type: 'feature',
    id: 7,
    tags: [
      { name: 'api', color: 'teal' },
      { name: 'html', color: 'pink' },
    ],
  },
]);
const task_done = ref([
  {
    task_title: 'Handle new user API',
    task_type: 'feature',
    id: 5,
    tags: [
      { name: 'api', color: 'teal' },
      { name: 'html', color: 'pink' },
      { name: 'css', color: 'yellow' },
    ],
  },
  {
    task_title: 'Handle issues in front-end linking',
    task_type: 'bug',
    id: 6,
    tags: [
      { name: 'js', color: 'orange' },
      { name: 'html', color: 'pink' },
    ],
  },
  {
    task_title: 'Manage back-end API calls',
    task_type: 'feature',
    id: 7,
    tags: [
      { name: 'api', color: 'teal' },
      { name: 'css', color: 'yellow' },
    ],
  },
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
        <div class="row">
          <div class="col-12">
            <q-btn
              v-if="$q.screen.gt.xs"
              outline
              dense
              no-wrap
              icon="add"
              no-caps
              color="green"
              label="Add Task"
              class="q-mt-sm q-ml-sm q-pr-sm bg-white"
              @click="add_new = true"
            ></q-btn>
            <q-btn-dropdown
              outline
              dense
              color="primary"
              icon="filter_list"
              class="q-mt-sm q-ml-sm bg-white"
              label="Add Filter"
            >
              <q-list>
                <q-item clickable v-close-popup>
                  <q-item-section>
                    <q-item-label>Filter 1</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup>
                  <q-item-section>
                    <q-item-label>Filter 2</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup>
                  <q-item-section>
                    <q-item-label>Filter 3</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <q-input
              class="float-right q-mt-sm q-mr-sm bg-white"
              v-model="search"
              label="Search here"
              outlined
              dense
              style="width: 35%"
            >
              <template v-slot:append>
                <q-icon
                  v-if="search !== ''"
                  name="close"
                  @click="search = ''"
                  class="cursor-pointer"
                />
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>
        <draggable
          class="row q-mt-xs"
          group="columns"
          v-bind="dragOptions"
          @start="drag = true"
          @end="drag = false"
        >
          <div class="col-3 q-px-xs">
            <div class="q-pa-xs column-background">
              <q-item
                style="cursor: move"
                class="q-pa-none text-white q-pa-sm to-do-title"
              >
                <q-item-section avatar style="min-width: 25px">
                  <q-icon name="list" class="q-pa-none q-ma-none" />
                </q-item-section>
                <q-item-section class="text-h6 text-weight-bolder"
                  >To do</q-item-section
                >
                <q-item-section avatar>
                  <q-icon name="more_vert" class="cursor-pointer">
                    <q-menu transition-show="rotate" transition-hide="rotate">
                      <q-list style="min-width: 100px">
                        <q-item clickable>
                          <q-item-section>Mark all as completed</q-item-section>
                        </q-item>
                        <q-item clickable>
                          <q-item-section
                            >Mark all as in progress</q-item-section
                          >
                        </q-item>
                        <q-item clickable>
                          <q-item-section>Mark all as hold</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-icon>
                </q-item-section>
              </q-item>
              <draggable
                class="list-group"
                :list="task_to_do"
                group="tasks"
                v-bind="dragOptions"
                @start="drag = true"
                @end="drag = false"
              >
                <q-card
                  square
                  v-for="(element, index) in task_to_do"
                  v-bind:key="index"
                  flat
                  bordered
                  class="box-shadow cursor-move bg-white q-mt-xs list-group-item border-todo"
                  :style="
                    element.task_type == 'bug'
                      ? 'border-left: 5px solid red !important'
                      : ''
                  "
                  @mouseover="task_index.to_do_index = index"
                  @mouseleave="task_index.to_do_index = null"
                >
                  <q-avatar
                    class="q-pa-none"
                    size="25px"
                    dense
                    :class="
                      element.task_type == 'bug'
                        ? 'bug bottom-right-radius'
                        : 'feature-to-do bottom-right-radius'
                    "
                    text-color="white"
                  >
                    <q-icon
                      filled
                      size="xs"
                      :name="
                        element.task_type == 'bug' ? 'bug_report' : 'assignment'
                      "
                    />
                  </q-avatar>
                  <span class="text-caption text-grey-9 q-ml-xs">
                    #{{ element.id }}
                    <q-icon
                      filled
                      size="xs"
                      name="close"
                      class="float-right text-weight-bolder"
                      :style="{
                        visibility:
                          index == task_index.to_do_index
                            ? 'visible'
                            : 'hidden',
                      }"
                      @click="deleteTask('task_to_do', task_index.to_do_index)"
                    />
                    <q-avatar class="float-right q-my-md" size="md">
                      <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
                    </q-avatar>
                  </span>
                  <q-card-section class="q-pt-sm">
                    <div class="row items-center no-wrap">
                      <div class="col">
                        <div>{{ element.task_title }}</div>
                      </div>
                    </div>
                  </q-card-section>
                  <q-badge
                    outline
                    class="q-mx-xs text-bold tag-badge"
                    v-bind:key="index"
                    v-for="(tag, index) in element.tags"
                    :color="tag.color"
                    >{{ tag.name }}
                  </q-badge>
                  <q-card-actions>
                    <q-btn
                      size="xs"
                      dense
                      filled
                      round
                      color="blue"
                      icon="message"
                    />
                    <q-btn
                      size="xs"
                      dense
                      filled
                      round
                      color="orange"
                      icon="flag"
                    />
                    <q-btn
                      size="xs"
                      dense
                      filled
                      round
                      color="grey"
                      icon="attachment"
                    />
                  </q-card-actions>
                </q-card>
              </draggable>
            </div>
          </div>

          <div class="col-3 q-px-xs">
            <div class="q-pa-xs column-background">
              <q-item
                style="cursor: move"
                class="q-pa-none text-white q-pa-sm in-progress-title"
              >
                <q-item-section avatar style="min-width: 25px">
                  <q-icon name="sync" class="q-pa-none q-ma-none" />
                </q-item-section>
                <q-item-section class="text-h6 text-weight-bolder"
                  >In progress</q-item-section
                >
                <q-item-section avatar>
                  <q-icon name="more_vert" class="cursor-pointer">
                    <q-menu transition-show="rotate" transition-hide="rotate">
                      <q-list style="min-width: 100px">
                        <q-item clickable>
                          <q-item-section>Mark all as completed</q-item-section>
                        </q-item>
                        <q-item clickable>
                          <q-item-section
                            >Mark all as in progress</q-item-section
                          >
                        </q-item>
                        <q-item clickable>
                          <q-item-section>Mark all as hold</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-icon>
                </q-item-section>
              </q-item>
              <draggable
                class="list-group"
                :list="task_in_progress"
                group="tasks"
                v-bind="dragOptions"
                @start="drag = true"
                @end="drag = false"
              >
                <q-card
                  square
                  v-for="(element, index) in task_in_progress"
                  v-bind:key="index"
                  flat
                  bordered
                  class="box-shadow cursor-move bg-white q-mt-xs list-group-item border-in-progress"
                  :style="
                    element.task_type == 'bug'
                      ? 'border-left: 5px solid red !important'
                      : ''
                  "
                  @mouseover="task_index.in_progress_index = index"
                  @mouseleave="task_index.in_progress_index = null"
                >
                  <q-avatar
                    class="q-pa-none"
                    size="25px"
                    dense
                    :class="
                      element.task_type == 'bug'
                        ? 'bug bottom-right-radius'
                        : 'feature-in-progress bottom-right-radius'
                    "
                    text-color="white"
                  >
                    <q-icon
                      filled
                      size="xs"
                      :name="
                        element.task_type == 'bug' ? 'bug_report' : 'assignment'
                      "
                    />
                  </q-avatar>
                  <span class="text-caption text-grey-9 q-ml-xs">
                    #{{ element.id }}
                    <q-icon
                      filled
                      size="xs"
                      name="close"
                      class="float-right text-weight-bolder"
                      :style="{
                        visibility:
                          index == task_index.in_progress_index
                            ? 'visible'
                            : 'hidden',
                      }"
                      @click="
                        deleteTask(
                          'task_in_progress',
                          task_index.in_progress_index
                        )
                      "
                    />
                    <q-avatar class="float-right q-my-md" size="md">
                      <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
                    </q-avatar>
                  </span>
                  <q-card-section class="q-pt-sm">
                    <div class="row items-center no-wrap">
                      <div class="col">
                        <div class>{{ element.task_title }}</div>
                      </div>
                    </div>
                  </q-card-section>
                  <q-badge
                    outline
                    v-bind:key="index"
                    class="q-mx-xs text-bold tag-badge tag-badge"
                    v-for="(tag, index) in element.tags"
                    :color="tag.color"
                    >{{ tag.name }}
                  </q-badge>
                  <q-card-actions>
                    <q-btn
                      size="xs"
                      dense
                      filled
                      round
                      color="blue"
                      icon="message"
                    />
                    <q-btn
                      size="xs"
                      dense
                      filled
                      round
                      color="orange"
                      icon="flag"
                    />
                    <q-btn
                      size="xs"
                      dense
                      filled
                      round
                      color="grey"
                      icon="attachment"
                    />
                  </q-card-actions>
                </q-card>
              </draggable>
            </div>
          </div>

          <div class="col-3 q-px-xs">
            <div class="q-pa-xs column-background">
              <q-item
                style="cursor: move"
                class="q-pa-none text-white q-pa-sm test-title"
              >
                <q-item-section avatar style="min-width: 25px">
                  <q-icon name="compare_arrows" class="q-pa-none q-ma-none" />
                </q-item-section>
                <q-item-section class="text-h6 text-weight-bolder"
                  >Test</q-item-section
                >
                <q-item-section avatar>
                  <q-icon name="more_vert" class="cursor-pointer">
                    <q-menu transition-show="rotate" transition-hide="rotate">
                      <q-list style="min-width: 100px">
                        <q-item clickable>
                          <q-item-section>Mark all as completed</q-item-section>
                        </q-item>
                        <q-item clickable>
                          <q-item-section
                            >Mark all as in progress</q-item-section
                          >
                        </q-item>
                        <q-item clickable>
                          <q-item-section>Mark all as hold</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-icon>
                </q-item-section>
              </q-item>
              <draggable
                class="list-group"
                :list="task_test"
                group="tasks"
                v-bind="dragOptions"
                @start="drag = true"
                @end="drag = false"
              >
                <q-card
                  square
                  v-for="(element, index) in task_test"
                  v-bind:key="index"
                  flat
                  bordered
                  class="box-shadow cursor-move bg-white q-mt-xs list-group-item border-test"
                  :style="
                    element.task_type == 'bug'
                      ? 'border-left: 5px solid red !important'
                      : ''
                  "
                  @mouseover="task_index.test_index = index"
                  @mouseleave="task_index.test_index = null"
                >
                  <q-avatar
                    class="q-pa-none"
                    size="25px"
                    dense
                    :class="
                      element.task_type == 'bug'
                        ? 'bug bottom-right-radius'
                        : 'feature-test bottom-right-radius'
                    "
                    text-color="white"
                  >
                    <q-icon
                      filled
                      size="xs"
                      :name="
                        element.task_type == 'bug' ? 'bug_report' : 'assignment'
                      "
                    />
                  </q-avatar>
                  <span class="text-caption text-grey-9 q-ml-xs">
                    #{{ element.id }}
                    <q-icon
                      filled
                      size="xs"
                      name="close"
                      class="float-right text-weight-bolder"
                      :style="{
                        visibility:
                          index == task_index.test_index ? 'visible' : 'hidden',
                      }"
                      @click="deleteTask('task_test', task_index.test_index)"
                    />
                    <q-avatar class="float-right q-my-md" size="md">
                      <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
                    </q-avatar>
                  </span>
                  <q-card-section class="q-pt-sm">
                    <div class="row items-center no-wrap">
                      <div class="col">
                        <div>{{ element.task_title }}</div>
                      </div>
                    </div>
                  </q-card-section>
                  <q-badge
                    outline
                    v-bind:key="index"
                    class="q-mx-xs text-bold tag-badge tag-badge"
                    v-for="(tag, index) in element.tags"
                    :color="tag.color"
                    >{{ tag.name }}
                  </q-badge>
                  <q-card-actions>
                    <q-btn
                      size="xs"
                      dense
                      filled
                      round
                      color="blue"
                      icon="message"
                    />
                    <q-btn
                      size="xs"
                      dense
                      filled
                      round
                      color="orange"
                      icon="flag"
                    />
                    <q-btn
                      size="xs"
                      dense
                      filled
                      round
                      color="grey"
                      icon="attachment"
                    />
                  </q-card-actions>
                </q-card>
              </draggable>
            </div>
          </div>

          <div class="col-3 q-px-xs">
            <div class="q-pa-xs column-background">
              <q-item
                style="cursor: move"
                class="q-pa-none text-white q-pa-sm done-title"
              >
                <q-item-section avatar style="min-width: 25px">
                  <q-icon
                    name="las la-check-circle"
                    class="q-pa-none q-ma-none"
                  />
                </q-item-section>
                <q-item-section class="text-h6 text-weight-bolder"
                  >Done</q-item-section
                >
                <q-item-section avatar>
                  <q-icon name="more_vert" class="cursor-pointer">
                    <q-menu transition-show="rotate" transition-hide="rotate">
                      <q-list style="min-width: 100px">
                        <q-item clickable>
                          <q-item-section>Mark all as completed</q-item-section>
                        </q-item>
                        <q-item clickable>
                          <q-item-section
                            >Mark all as in progress</q-item-section
                          >
                        </q-item>
                        <q-item clickable>
                          <q-item-section>Mark all as hold</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-icon>
                </q-item-section>
              </q-item>
              <draggable
                class="list-group"
                :list="task_done"
                group="tasks"
                v-bind="dragOptions"
                @start="drag = true"
                @end="drag = false"
              >
                <q-card
                  square
                  v-for="(element, index) in task_done"
                  v-bind:key="index"
                  flat
                  bordered
                  class="box-shadow cursor-move bg-white q-mt-xs list-group-item border-done"
                  :style="
                    element.task_type == 'bug'
                      ? 'border-left: 5px solid red !important'
                      : ''
                  "
                  @mouseover="task_index.done_index = index"
                  @mouseleave="task_index.done_index = null"
                >
                  <q-avatar
                    class="q-pa-none"
                    size="25px"
                    dense
                    :class="
                      element.task_type == 'bug'
                        ? 'bug bottom-right-radius'
                        : 'feature-done bottom-right-radius'
                    "
                    text-color="white"
                  >
                    <q-icon
                      filled
                      size="xs"
                      :name="
                        element.task_type == 'bug' ? 'bug_report' : 'assignment'
                      "
                    />
                  </q-avatar>
                  <span class="text-caption text-grey-9 q-ml-xs">
                    #{{ element.id }}
                    <q-icon
                      filled
                      size="xs"
                      name="close"
                      class="float-right text-weight-bolder"
                      :style="{
                        visibility:
                          index == task_index.done_index ? 'visible' : 'hidden',
                      }"
                      @click="deleteTask('task_done', task_index.done_index)"
                    />
                    <q-avatar class="float-right q-my-md" size="md">
                      <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
                    </q-avatar>
                  </span>
                  <q-card-section class="q-pt-sm">
                    <div class="row items-center no-wrap">
                      <div class="col">
                        <div class>{{ element.task_title }}</div>
                      </div>
                    </div>
                  </q-card-section>
                  <q-badge
                    outline
                    v-bind:key="index"
                    class="q-mx-xs text-bold tag-badge tag-badge"
                    v-for="(tag, index) in element.tags"
                    :color="tag.color"
                    >{{ tag.name }}
                  </q-badge>
                  <q-card-actions>
                    <q-btn
                      size="xs"
                      dense
                      filled
                      round
                      color="blue"
                      icon="message"
                    />
                    <q-btn
                      size="xs"
                      dense
                      filled
                      round
                      color="orange"
                      icon="flag"
                    />
                    <q-btn
                      size="xs"
                      dense
                      filled
                      round
                      color="grey"
                      icon="attachment"
                    />
                  </q-card-actions>
                </q-card>
              </draggable>
            </div>
          </div>
        </draggable>
      </q-tab-pannel>
    </q-tab-panels>
  </q-page>
</template>
