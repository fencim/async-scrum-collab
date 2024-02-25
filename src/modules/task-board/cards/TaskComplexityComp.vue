<template>
  <q-badge
    v-if="task.complexity && activeStore.canUserModerate"
    class="on-right cursor-pointer"
    @click="vote"
    >{{ task.complexity }}</q-badge
  >
  <q-badge v-else-if="task.complexity" class="on-right">{{
    task.complexity
  }}</q-badge>
  <q-btn dense v-else icon="poll" @click="vote"></q-btn>
</template>
<script lang="ts" setup>
import { TheDialogs } from 'src/dialogs/the-dialogs';
import { DiscussionItem } from 'src/entities';
import { useActiveStore } from 'src/stores/active.store';
const activeStore = useActiveStore();
const props = defineProps<{
  task: DiscussionItem;
}>();
function vote() {
  TheDialogs.emit({
    type: 'voteForItemComplexity',
    arg: { item: props.task },
  });
}
</script>
