<script lang="ts" setup>
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { DiscussionItem, IProfile } from 'src/entities';
import { useActiveStore } from 'src/stores/active.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { PropType, defineProps } from 'vue';
const activeStore = useActiveStore();

defineProps({
  task: {
    required: true,
    type: Object as PropType<DiscussionItem>,
  },
});
function iterationKey(task: DiscussionItem) {
  return typeof task.iteration == 'object'
    ? task.iteration.key
    : task.iteration;
}
function assignTaskTo(task: DiscussionItem, profile: IProfile) {
  const discussionStore = useDiscussionStore();
  return discussionStore.assignTaskTo(task, profile);
}
</script>
<template>
  <q-btn-dropdown
    round
    content-class="bg-transparent no-shadow"
    no-icon-animation
    dropdown-icon="person"
    size="sm"
  >
    <RecentActiveMembers
      sizes="xs"
      :profiles="activeStore.activeMembers"
      @click-profile="(p) => assignTaskTo(task, p)"
    />
  </q-btn-dropdown>
  <q-btn
    :to="{
      name: 'editDiscussion',
      params: {
        project: task.projectKey,
        iteration: iterationKey(task),
        ceremony: iterationKey(task) + 'plan',
        item: task.key,
      },
    }"
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
    round
    icon="message"
    size="sm"
    ><q-tooltip>Convo</q-tooltip></q-btn
  >
</template>
