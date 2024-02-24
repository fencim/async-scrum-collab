<script lang="ts" setup>
import {
  PlanningTypes,
  IScrumReport,
  DiscussionItem,
  PlanningItem,
  IRoadBlock,
} from 'src/entities';
import { entityKey } from 'src/entities/base.entity';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { computed, onUpdated, ref } from 'vue';
import { formatKey } from '../discussion.helper';
import { TheWorkflows } from 'src/workflows/the-workflows';

const props = defineProps<{
  value: IScrumReport;
}>();
const $emits = defineEmits(['input']);
onUpdated(() => {
  $emits('input', theDiscussion.value);
});

const theDiscussion = ref<IScrumReport>({ ...props.value });
theDiscussion.value.todoTasks = theDiscussion.value.todoTasks ?? [];
theDiscussion.value.tasksDid = theDiscussion.value.tasksDid ?? [];
theDiscussion.value.roadblocks = theDiscussion.value.roadblocks ?? [];

const newRoadblock = ref<IRoadBlock>();
const getNewRoadblock = ref(false);
function enterNewRoadblock() {
  newRoadblock.value = {
    iteration: theDiscussion.value.iteration,
    projectKey: theDiscussion.value.projectKey,
    ceremonyKey: '',
    description: '',
    label: '#',
    awareness: {},
    key: '',
    type: 'roadblock',
  };
  getNewRoadblock.value = true;
}
async function createRoadblock() {
  const item = newRoadblock.value;
  if (!item || !item.iteration || !item.projectKey) return;
  const saved = await TheWorkflows.emitPromised<IRoadBlock>({
    type: 'createDiscussion',
    arg: {
      item: item,
      iterationKey: entityKey(item.iteration),
      projectKey: entityKey(item.projectKey),
    },
  });
  if (saved) {
    theDiscussion.value.roadblocks.push(saved.key);
  }
  getNewRoadblock.value = false;
}
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
  return discussions.value.filter((d) => !d.doneDate && d.status);
});
const roadblocksDiscussions = computed(() => {
  return discussionStore.discussions.filter(
    (d) =>
      d.type == 'roadblock' &&
      theDiscussion.value.iteration &&
      d.iteration &&
      entityKey(d.iteration) == entityKey(theDiscussion.value.iteration) &&
      !d.doneDate
  );
});
function describeDiscussion(item: DiscussionItem | string): string {
  if (typeof item == 'object') {
    return (
      '[' +
      formatKey(item.key) +
      '] ' +
      discussionStore.describeDiscussion(item)
    );
  } else {
    const disc = discussionStore.discussions.find((d) => d.key == item);
    return (disc && describeDiscussion(disc)) || 'Unknown Roadblock';
  }
}
</script>
<template>
  <q-banner
    v-if="doneDiscussions.length + pendingDiscussions.length == 0"
    class="bg-negative full-width"
    rounded
  >
    No task/discussion items in sprint assigned to you
  </q-banner>
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
      <q-btn
        round
        dense
        flat
        icon="add_comment"
        @click="enterNewRoadblock"
      ></q-btn>
    </template>
  </q-select>
  <q-dialog v-model="getNewRoadblock">
    <q-card
      v-if="newRoadblock"
      :style="'min-width: ' + $q.screen.sizes.sm + 'px;'"
    >
      <q-form @submit="createRoadblock">
        <q-banner>
          <template #avatar>
            <q-icon name="report_problem" />
          </template>
          <template #action>
            <div class="absolute-top-right q-ma-sm">
              <q-btn v-close-popup icon="close" round />
            </div>
          </template>
          Report Roadblock
        </q-banner>
        <q-card-section>
          <q-input
            v-model="newRoadblock.description"
            type="textarea"
            :rules="[(val:string) => val.length > 1 || 'Describe your roadblock' ]"
            label="Description"
          />
          <q-input
            v-model="newRoadblock.label"
            label="#label"
            class="text-lowercase"
            :rules="[(val:string) => val.length > 1 || 'Categorize roadblock by labeling' ]"
          />
        </q-card-section>
        <q-card-actions>
          <q-space />
          <q-btn icon="add_comment" type="submit">Submit</q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>
