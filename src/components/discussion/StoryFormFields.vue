<script lang="ts" setup>
import { DiscussionItem, IAcceptanceCriteria, IStory } from 'src/entities';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { computed, onUpdated, ref } from 'vue';

const props = defineProps<{
  value: IStory;
}>();
const theDiscussion = ref<IStory>(props.value);
const $emits = defineEmits(['input']);
const updating = ref(false);
onUpdated(() => {
  if (updating.value) return;
  updating.value = true;
  $emits('input', JSON.parse(JSON.stringify(theDiscussion.value)));
  updating.value = false;
});
const acceptanceCriteriaColumns = [
  {
    name: 'given',
    label: 'Given',
    field: (c: IAcceptanceCriteria) =>
      typeof c.given == 'string' ? c.given : c.given.join(' And '),
  },
  {
    name: 'when',
    label: 'When',
    field: (c: IAcceptanceCriteria) =>
      typeof c.when == 'string' ? c.when : c.when.join(' And '),
  },
  {
    name: 'then',
    label: 'Then',
    field: (c: IAcceptanceCriteria) =>
      typeof c.then == 'string' ? c.then : c.then.join(' And '),
  },
  {
    name: 'action',
    label: 'Action',
    field: 'action',
  },
];
const theAcceptance = ref<IAcceptanceCriteria | undefined>();
const dialogAcceptance = ref(false);
const targetACIndex = ref<number>();

function newAcceptanceCriteria() {
  theAcceptance.value = {
    given: [''],
    then: [''],
    when: [''],
  } as IAcceptanceCriteria;
  targetACIndex.value = undefined;
  dialogAcceptance.value = true;
}
function editAcceptanceCriteria(record: IAcceptanceCriteria, index: number) {
  theAcceptance.value = {
    given: typeof record.given == 'string' ? [record.given] : [...record.given],
    when: typeof record.when == 'string' ? [record.when] : [...record.when],
    then: typeof record.then == 'string' ? [record.then] : [...record.then],
  };
  targetACIndex.value = index;
  dialogAcceptance.value = true;
}
function createAcceptance() {
  if (
    !theAcceptance?.value?.given ||
    !theAcceptance?.value?.when ||
    !theAcceptance?.value?.then
  ) {
    return;
  }
  if (theDiscussion.value?.type == 'story') {
    theDiscussion.value.acceptanceCriteria =
      theDiscussion.value.acceptanceCriteria || [];
    theDiscussion.value.acceptanceCriteria.push(theAcceptance.value);
    theAcceptance.value = {} as IAcceptanceCriteria;
    dialogAcceptance.value = false;
  }
}
function updateAcceptance() {
  if (
    !theAcceptance?.value?.given ||
    !theAcceptance?.value?.when ||
    !theAcceptance?.value?.then
  ) {
    return;
  }
  if (
    theDiscussion.value?.type == 'story' &&
    typeof targetACIndex.value == 'number'
  ) {
    theDiscussion.value.acceptanceCriteria =
      theDiscussion.value.acceptanceCriteria || [];
    theDiscussion.value.acceptanceCriteria.splice(
      targetACIndex.value,
      1,
      theAcceptance.value
    );
    theAcceptance.value = {} as IAcceptanceCriteria;
    dialogAcceptance.value = false;
    targetACIndex.value = undefined;
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
    grid
  >
    <template v-slot:top>
      <q-btn
        icon="add"
        label="Add Acceptance Criteria"
        @click="newAcceptanceCriteria()"
      />
    </template>
    <template v-slot:item="props">
      <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
        <q-card flat bordered>
          <q-card-section>
            <strong>Given </strong>
            <span v-if="typeof props.row.given == 'string'">{{
              props.row.given
            }}</span>
            <span v-else>{{ props.row.given.join(' And ') }}</span
            >,
            <strong> When </strong>
            <span v-if="typeof props.row.when == 'string'">{{
              props.row.when
            }}</span>
            <span v-else>{{ props.row.when.join(' And ') }}</span
            >,
            <strong> Then </strong>
            <span v-if="typeof props.row.then == 'string'">{{
              props.row.then
            }}</span>
            <span v-else>{{ props.row.then.join(' And ') }}</span>
            <q-space />
            <q-btn
              icon="edit"
              flat
              dense
              round
              @click="editAcceptanceCriteria(props.row, props.rowIndex)"
            />
          </q-card-section>
        </q-card>
      </div>
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
  <q-dialog v-model="dialogAcceptance" class="fixed">
    <q-card v-if="theAcceptance">
      <q-card-section class="row">
        <q-input
          :class="theAcceptance.given.length > 1 ? 'col-6' : 'col'"
          v-model="theAcceptance.given[0]"
          label="Given"
        >
          <template #after v-if="theAcceptance.given.length == 1">
            <q-btn
              rounded
              dense
              @click="theAcceptance.given.push('')"
              icon="loupe"
              flat
              size="sm"
              ><q-tooltip>And</q-tooltip></q-btn
            >
          </template>
        </q-input>
        <template
          v-for="(_, index) in theAcceptance.given.slice(1)"
          :key="index"
        >
          <q-input
            :class="
              index == theAcceptance.given.length - 2 && index % 2 == 1
                ? 'col-12'
                : 'col-6'
            "
            v-model="theAcceptance.given[index + 1]"
            label="And"
          >
            <template #after v-if="index == theAcceptance.given.length - 2">
              <q-btn
                rounded
                dense
                @click="theAcceptance.given.push('')"
                icon="loupe"
                flat
                size="sm"
                ><q-tooltip>And</q-tooltip></q-btn
              >
            </template>
          </q-input>
        </template>
      </q-card-section>
      <q-card-section class="row">
        <q-input
          :class="theAcceptance.when.length > 1 ? 'col-6' : 'col'"
          v-model="theAcceptance.when[0]"
          label="When"
        >
          <template #after v-if="theAcceptance.when.length == 1">
            <q-btn
              rounded
              dense
              @click="theAcceptance.when.push('')"
              icon="loupe"
              flat
              size="sm"
              ><q-tooltip>And</q-tooltip></q-btn
            >
          </template>
        </q-input>
        <template
          v-for="(_, index) in theAcceptance.when.slice(1)"
          :key="index"
        >
          <q-input
            :class="
              index == theAcceptance.when.length - 2 && index % 2 == 1
                ? 'col-12'
                : 'col-6'
            "
            v-model="theAcceptance.when[index + 1]"
            label="And"
          >
            <template #after v-if="index == theAcceptance.when.length - 2">
              <q-btn
                rounded
                dense
                @click="theAcceptance.when.push('')"
                icon="loupe"
                flat
                size="sm"
                ><q-tooltip>And</q-tooltip></q-btn
              >
            </template>
          </q-input>
        </template>
      </q-card-section>
      <q-card-section class="row">
        <q-input
          :class="theAcceptance.then.length > 1 ? 'col-6' : 'col'"
          v-model="theAcceptance.then[0]"
          label="Then"
        >
          <template #after v-if="theAcceptance.then.length == 1">
            <q-btn
              rounded
              dense
              @click="theAcceptance.then.push('')"
              icon="loupe"
              flat
              size="sm"
              ><q-tooltip>And</q-tooltip></q-btn
            >
          </template>
        </q-input>
        <template
          v-for="(_, index) in theAcceptance.then.slice(1)"
          :key="index"
        >
          <q-input
            :class="
              index == theAcceptance.then.length - 2 && index % 2 == 1
                ? 'col-12'
                : 'col-6'
            "
            v-model="theAcceptance.then[index + 1]"
            label="And"
          >
            <template #after v-if="index == theAcceptance.then.length - 2">
              <q-btn
                rounded
                dense
                @click="theAcceptance.then.push('')"
                icon="loupe"
                flat
                size="sm"
                ><q-tooltip>And</q-tooltip></q-btn
              >
            </template>
          </q-input>
        </template>
      </q-card-section>
      <q-card-actions>
        <q-space />
        <q-btn
          v-if="typeof targetACIndex == 'undefined'"
          icon="add"
          @click="createAcceptance"
          >Add</q-btn
        >
        <q-btn v-else icon="save" @click="updateAcceptance">Update</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
