<script lang="ts" setup>
import { DiscussionItem } from 'src/entities';
import { PropType, defineProps } from 'vue';

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
</script>
<template>
  <q-btn round icon="person" size="sm"><q-tooltip>Assign</q-tooltip></q-btn>
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
