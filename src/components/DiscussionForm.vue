<template>
  <q-card>
    <q-form @submit="submitDiscussion(savePlus)">
      <q-toolbar>
        <q-avatar>
          <img src="/icons/favicon-128x128.png" />
        </q-avatar>
        <q-toolbar-title
          ><span class="text-weight-bold">{{ item ? 'Edit' : 'New' }}</span>
          Discussion of {{ activeProject?.name }} {{ type }}
        </q-toolbar-title>
      </q-toolbar>
      <div v-if="refItem" class="q-pa-sm q-mx-sm shadow-5 rounded-borders">
        <component
          :is="getComponent(refItem)"
          :task="refItem"
          mini
          header-only
          no-action
        />
      </div>
      <q-card-section class="row" v-if="!item && !type">
        <q-select
          class="col-12"
          emit-value
          map-options
          label="Type"
          v-model="theDiscussion.type"
          :options="[
            { v: 'goal', t: 'Sprint Goal' },
            { v: 'objective', t: 'Sprint Objective' },
            { v: 'story', t: 'User Story' },
            { v: 'task', t: 'Technical Task' },
          ]"
          option-value="v"
          option-label="t"
        />
      </q-card-section>
      <q-card-section
        v-if="!refItem && PlanningTypes.includes(theDiscussion.type as PlanningItem['type'])"
        class="row"
      >
        <q-select
          class="col-12"
          emit-value
          label="Parent"
          map-options
          v-model="theDiscussion.parent"
          :options="discussions.filter((d) => d.type != 'task')"
          :option-label="describeDiscussion"
          option-value="key"
        >
        </q-select>
      </q-card-section>
      <q-card-section v-if="theDiscussion.type == 'goal'" class="row">
        <goal-form-fields
          :value="theDiscussion"
          @input="(v) => (theDiscussion = v)"
        />
      </q-card-section>
      <q-card-section v-else-if="theDiscussion.type == 'objective'" class="row">
        <objective-form-fields
          :iteration="iteration"
          :value="theDiscussion"
          @input="(v) => (theDiscussion = v)"
        />
      </q-card-section>
      <q-card-section v-else-if="theDiscussion.type == 'story'" class="row">
        <story-form-fields
          :value="theDiscussion"
          @input="(v) => (theDiscussion = v)"
        />
      </q-card-section>
      <q-card-section v-else-if="theDiscussion.type == 'task'" class="row">
        <task-form-fields
          :value="theDiscussion"
          @input="(v) => (theDiscussion = v)"
        />
      </q-card-section>
      <q-card-section v-else-if="theDiscussion.type == 'scrum'" class="row">
        <scrum-form-fields
          :value="theDiscussion"
          @input="(v) => (theDiscussion = v)"
        />
      </q-card-section>
      <q-card-section v-else-if="theDiscussion.type == 'roadblock'" class="row">
        <roadblock-form-fields
          :value="theDiscussion"
          @input="(v) => (theDiscussion = v)"
        />
      </q-card-section>
      <q-card-actions :align="'right'">
        <q-btn icon="close" v-close-popup>Cancel</q-btn>
        <q-btn
          v-if="!item?.key"
          icon="save"
          @click="savePlus = true"
          :loading="saving"
          type="submit"
        >
          Save ++
          <q-tooltip>Save {{ type }} and Create Another</q-tooltip>
        </q-btn>
        <q-btn
          icon="save"
          :loading="saving"
          @click="savePlus = false"
          type="submit"
          >Save {{ type }}</q-btn
        >
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts" setup>
import {
  DiscussionItem,
  ICeremony,
  IIteration,
  IProject,
  PlanningItem,
  PlanningTypes,
} from 'src/entities';
import { entityKey } from 'src/entities/base.entity';
import { getComponent } from 'src/modules/task-board/card-components';
import { useActiveStore } from 'src/stores/active.store';
import { useCeremonyStore } from 'src/stores/ceremonies.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useIterationStore } from 'src/stores/iterations.store';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import GoalFormFields from './discussion/GoalFormFields.vue';
import ObjectiveFormFields from './discussion/ObjectiveFormFields.vue';
import StoryFormFields from './discussion/StoryFormFields.vue';
import TaskFormFields from './discussion/TaskFormFields.vue';
import ScrumFormFields from './discussion/ScrumFormFields.vue';
import { TheWorkflows } from 'src/workflows/the-workflows';
import RoadblockFormFields from './discussion/RoadblockFormFields.vue';

const activeStore = useActiveStore();
const iterationStore = useIterationStore();
const ceremonyStore = useCeremonyStore();
const discussionStore = useDiscussionStore();
const props = defineProps<{
  item?: DiscussionItem;
  type?: DiscussionItem['type'];
  iteration?: IIteration;
  status?: string;
  projectKey?: string;
  refItem?: DiscussionItem;
  assignedTo?: string;
}>();
const $emit = defineEmits(['closeForm', 'createAnother']);

const activeProjectKey = ref('AA1');
const activeProject = ref<IProject | undefined>();
const activeIterationKey = ref('');
const activeIteration = ref<IIteration | undefined>();
const activeCeremonyKey = ref('');
const activeCeremony = ref<ICeremony | undefined>();
const saving = ref(false);
const savePlus = ref(false);
const theDiscussion = ref<DiscussionItem>(
  props.item ||
    ({
      type: props.type || 'task',
      projectKey: props.projectKey || props.refItem?.projectKey || '',
      iteration: props.iteration || props.refItem?.iteration || '',
      ceremonyKey: props.refItem?.ceremonyKey || activeCeremonyKey.value || '',
      status: props.status || props.refItem?.status || '',
      assignedTo: props.assignedTo,
      key: '',
      description: '',
    } as DiscussionItem)
);

onMounted(async () => {
  const route = useRoute();
  const discussion = props.item || props.refItem;
  activeProjectKey.value =
    discussion?.projectKey || activeStore.activeProject?.key || '';
  activeProject.value = activeStore.activeProject;

  activeIterationKey.value =
    (discussion?.iteration && entityKey(discussion?.iteration)) ||
    (route.params.iteration as string);
  activeIteration.value = iterationStore.iterations.find(
    (i) => i.key == activeIterationKey.value
  );

  activeCeremonyKey.value = route.params.ceremony as string;
  if (activeCeremonyKey.value) {
    activeCeremony.value = await ceremonyStore.withKey(
      activeProjectKey.value,
      activeIterationKey.value,
      activeCeremonyKey.value
    );
  }
  theDiscussion.value = {
    ...theDiscussion.value,
    ...(props.item || {}),
    projectKey: activeProjectKey.value,
    iteration:
      theDiscussion.value.iteration ||
      (activeIteration.value && { ...activeIteration.value }) ||
      activeIterationKey.value,
    ceremonyKey: theDiscussion.value.ceremonyKey || activeCeremonyKey.value,
  };
  if (
    theDiscussion.value.type == 'objective' &&
    props.refItem?.type == 'goal'
  ) {
    theDiscussion.value.parent = props.refItem.key;
  }
});

function describeDiscussion(item: DiscussionItem) {
  return discussionStore.describeDiscussion(item);
}
const discussions = computed(() => {
  return discussionStore.discussions;
});

async function submitDiscussion(createAnother?: boolean) {
  saving.value = true;
  if (!props.item || !theDiscussion.value.key) {
    let counter = discussions.value.length;
    let key: string;
    do {
      key = activeProjectKey.value + theDiscussion.value.type + counter;
      counter++;
    } while (discussions.value.find((d) => d.key == key));
    theDiscussion.value.key = key;
    theDiscussion.value.iteration =
      theDiscussion.value.iteration || activeIterationKey.value;
    theDiscussion.value.projectKey = activeProjectKey.value;
    theDiscussion.value.ceremonyKey =
      theDiscussion.value.ceremonyKey || activeCeremonyKey.value;
    if (props.refItem) {
      theDiscussion.value.parent = entityKey(props.refItem);
    }
    TheWorkflows.emit({
      type: 'createDiscussion',
      arg: {
        item: theDiscussion.value,
        iterationKey: activeIterationKey.value,
        projectKey: activeProjectKey.value,
        done(item) {
          saving.value = false;
          if (createAnother) {
            $emit('createAnother', item);
          } else {
            $emit('closeForm', item);
          }
        },
      },
    });
  } else {
    TheWorkflows.emit({
      type: 'updateDiscussionFields',
      arg: {
        item: JSON.parse(JSON.stringify(theDiscussion.value)),
        done(discussion) {
          saving.value = false;
          $emit('closeForm', discussion);
        },
      },
    });
  }
}
</script>
<style></style>
