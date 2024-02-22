<script lang="ts" setup>
import {
  PlanningTypes,
  IScrumReport,
  DiscussionItem,
  PlanningItem,
} from 'src/entities';
import { entityKey } from 'src/entities/base.entity';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { computed, onUpdated, ref } from 'vue';
import { formatKey } from '../discussion.helper';

const props = defineProps<{
  value: IScrumReport;
}>();
const theDiscussion = ref<IScrumReport>({ ...props.value });
theDiscussion.value.todoTasks = theDiscussion.value.todoTasks ?? [];
theDiscussion.value.tasksDid = theDiscussion.value.tasksDid ?? [];
theDiscussion.value.roadblocks = theDiscussion.value.roadblocks ?? [];

const $emits = defineEmits(['input']);
onUpdated(() => {
  $emits('input', theDiscussion.value);
});
const discussionStore = useDiscussionStore();
const discussions = computed(() => {
  return discussionStore.discussions.filter(
    (d) =>
      PlanningTypes.includes(d.type as PlanningItem['type']) &&
      props.value.assignedTo &&
      d.assignees
        ?.map((a) => entityKey(a))
        .includes(entityKey(props.value.assignedTo))
  );
});
const doneDiscussions = computed(() => {
  return discussions.value.filter((d) => !!d.doneDate);
});
const pendingDiscussions = computed(() => {
  return discussions.value.filter((d) => !d.doneDate);
});
const roadblocksDiscussions = computed(() => {
  return discussions.value.filter((d) => d.type == 'roadblock' && !!d.doneDate);
});
function describeDiscussion(item: DiscussionItem) {
  return (
    '[' + formatKey(item.key) + '] ' + discussionStore.describeDiscussion(item)
  );
}
</script>
<template>
  <q-select
    class="col-12"
    emit-value
    label="I did (recently)"
    map-options
    multiple
    use-chips
    v-model="theDiscussion.tasksDid"
    :options="doneDiscussions"
    :option-label="describeDiscussion"
    option-value="key"
    :rules="[
      () =>
        theDiscussion.tasksDid.length + theDiscussion.todoTasks.length > 0 ||
        'Select task',
    ]"
  >
  </q-select>
  <q-select
    class="col-12"
    emit-value
    label="Planned to do(by now)"
    map-options
    multiple
    use-chips
    v-model="theDiscussion.todoTasks"
    :options="pendingDiscussions"
    :option-label="describeDiscussion"
    option-value="key"
    :rules="[
      () =>
        theDiscussion.tasksDid.length + theDiscussion.todoTasks.length > 0 ||
        'Select task',
    ]"
  >
  </q-select>
  <q-select
    class="col-12"
    emit-value
    label="Roadblocks"
    map-options
    multiple
    use-chips
    v-model="theDiscussion.roadblocks"
    :options="roadblocksDiscussions"
    :option-label="describeDiscussion"
    option-value="key"
  >
    <template #before>
      <q-btn round dense flat icon="add_comment"></q-btn>
    </template>
  </q-select>
</template>
