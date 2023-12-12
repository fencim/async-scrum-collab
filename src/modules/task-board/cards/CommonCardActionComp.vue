<script lang="ts" setup>
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { TheDialogs } from 'src/dialogs/the-dialogs';
import { DiscussionItem, IProfile, ISprintBoardColumn } from 'src/entities';
import { convoBus } from 'src/modules/ceremony/convo-bus';
import { useActiveStore } from 'src/stores/active.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useIterationStore } from 'src/stores/iterations.store';
import { PropType, defineProps } from 'vue';
const activeStore = useActiveStore();
const iterationStore = useIterationStore();
const discussionStore = useDiscussionStore();
const emits = defineEmits<{
  (
    e: 'taskMoved',
    issue: DiscussionItem,
    column?: ISprintBoardColumn,
    iterationKey?: string
  ): void;
}>();
defineProps({
  task: {
    required: true,
    type: Object as PropType<DiscussionItem>,
  },
});
function iterationKey(task: DiscussionItem) {
  return typeof task.iteration == 'object'
    ? task.iteration.key
    : task.iteration || '';
}
function assignTaskTo(task: DiscussionItem, profile: IProfile) {
  return discussionStore.assignTaskTo(task, profile);
}
function moveTask(
  task: DiscussionItem,
  column?: ISprintBoardColumn,
  iteration?: string
) {
  const copy = { ...task };
  emits('taskMoved', copy, column, iteration || iterationKey(task));
}
function getColumns(): ISprintBoardColumn[] {
  return (activeStore.activeProject?.boardColumns || []).map((c) => ({
    ...c,
    tasks: [],
  }));
}
function getIterations() {
  return iterationStore.iterations || [];
}
</script>
<template>
  <q-btn
    v-close-popup
    @click="TheDialogs.emit({ type: 'viewTask', arg: task })"
    round
    icon="info"
    size="sm"
    ><q-tooltip>Details</q-tooltip></q-btn
  >
  <q-btn-dropdown
    round
    content-class="bg-transparent no-shadow"
    no-icon-animation
    dropdown-icon="person"
    size="sm"
  >
    <RecentActiveMembers
      sizes="xs"
      v-close-popup
      :profiles="activeStore.activeMembers"
      @click-profile="(p) => assignTaskTo(task, p)"
    />
  </q-btn-dropdown>
  <q-btn
    @click="
      TheDialogs.emit({
        type: 'editTask',
        arg: {
          item: task,
        },
      })
    "
    v-close-popup
    round
    icon="edit"
    size="sm"
    ><q-tooltip>Edit</q-tooltip></q-btn
  >
  <q-btn
    :to="{
      name: 'convo',
      params: {
        project: task.projectKey,
        iteration: iterationKey(task),
        ceremony: iterationKey(task) + 'plan',
        item: task.key,
      },
    }"
    v-close-popup
    round
    icon="message"
    size="sm"
    ><q-tooltip>Convo</q-tooltip></q-btn
  >
  <q-btn-dropdown
    round
    v-if="$q.screen.lt.md"
    no-icon-animation
    dropdown-icon="exit_to_app"
    size="sm"
  >
    <q-list>
      <q-item
        clickable
        dense
        @click="moveTask(task, undefined, iteration.key)"
        v-close-popup
        v-for="iteration in getIterations()"
        :key="iteration.key"
        :active="iteration.key == iterationKey(task)"
      >
        <q-item-section avatar>
          <q-icon name="splitscreen" />
        </q-item-section>
        {{ iteration.name }}
      </q-item>
    </q-list>
  </q-btn-dropdown>
  <q-btn-dropdown
    round
    v-if="$q.screen.lt.md"
    no-icon-animation
    dropdown-icon="switch_left"
    size="sm"
  >
    <q-list>
      <q-item
        dense
        clickable
        v-close-popup
        @click="moveTask(task, column)"
        v-for="column in getColumns()"
        :key="column.key"
        :active="column.key == task.status"
      >
        <q-item-section avatar>
          <q-icon :name="column.icon" />
        </q-item-section>
        {{ column.name }}
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>
