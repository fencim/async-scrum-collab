<script lang="ts" setup>
import { DiscussionItem, IAcceptanceCriteria, IStory } from 'src/entities';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { computed, onUpdated, ref } from 'vue';

const props = defineProps<{
  value: IStory;
}>();
const theDiscussion = ref<IStory>(props.value);
const $emits = defineEmits(['input']);
onUpdated(() => {
  $emits('input', theDiscussion.value);
});
const acceptanceCriteriaColumns = [
  {
    name: 'given',
    label: 'Given',
    field: 'given',
  },
  {
    name: 'when',
    label: 'When',
    field: 'when',
  },
  {
    name: 'then',
    label: 'Then',
    field: 'then',
  },
];
const newAcceptance = ref<IAcceptanceCriteria | undefined>();
const dialogAcceptance = ref(false);
function newAcceptanceCriteria() {
  newAcceptance.value = {} as IAcceptanceCriteria;
  dialogAcceptance.value = true;
}
function createAcceptance() {
  if (
    !newAcceptance?.value?.given ||
    !newAcceptance?.value?.when ||
    !newAcceptance?.value?.then
  ) {
    return;
  }
  if (theDiscussion.value?.type == 'story') {
    theDiscussion.value.acceptanceCriteria =
      theDiscussion.value.acceptanceCriteria || [];
    theDiscussion.value.acceptanceCriteria.push(newAcceptance.value);
    newAcceptance.value = {} as IAcceptanceCriteria;
    dialogAcceptance.value = false;
  }
}
const discussions = computed(() => {
  const discussionStore = useDiscussionStore();
  return discussionStore.discussions.filter((d) => d.type == 'task');
});
function describeDiscussion(item: DiscussionItem) {
  const discussionStore = useDiscussionStore();
  return discussionStore.describeDiscussion(item);
}
</script>
<template>
  <q-input
    class="col-12"
    v-model="theDiscussion.description"
    label="Description"
    type="textarea"
  />
  <q-input class="col-6" v-model="theDiscussion.targetUser" label="As a" />
  <q-input class="col-6" v-model="theDiscussion.subject" label="I want to" />
  <q-input class="col-12" v-model="theDiscussion.purpose" label="So that" />
  <q-table
    class="col-12"
    :rows="theDiscussion.acceptanceCriteria"
    :columns="acceptanceCriteriaColumns"
  >
    <template v-slot:top>
      <q-btn
        icon="add"
        label="Add Acceptance Criteria"
        @click="newAcceptanceCriteria()"
      />
    </template>
  </q-table>
  <q-select
    class="col-12"
    emit-value
    label="Tasks"
    v-if="theDiscussion.key"
    map-options
    multiple
    v-model="theDiscussion.tasks"
    :options="discussions"
    :option-label="describeDiscussion"
    option-value="key"
  />
  <q-dialog v-model="dialogAcceptance">
    <q-card v-if="newAcceptance">
      <q-card-section>
        <q-input v-model="newAcceptance.given" label="Given" />
        <q-input v-model="newAcceptance.when" label="When" />
        <q-input v-model="newAcceptance.then" label="Then" />
      </q-card-section>
      <q-card-actions>
        <q-btn icon="add" @click="createAcceptance">Add</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
