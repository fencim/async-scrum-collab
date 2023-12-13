<template>
  <q-card>
    <q-form @submit="submitDiscussion">
      <q-toolbar>
        <q-avatar>
          <img src="/icons/favicon-128x128.png" />
        </q-avatar>
        <q-toolbar-title
          ><span class="text-weight-bold">{{
            $route.params.item ? 'Edit' : 'New'
          }}</span>
          Discussion of {{ activeProject?.name }}</q-toolbar-title
        >
      </q-toolbar>
      <div v-if="refItem" class="q-pa-sm q-mx-sm shadow-5 rounded-borders">
        <component
          class=""
          :is="getComponent(refItem)"
          :task="refItem"
          mini
          no-action
        />
      </div>
      <q-card-section class="row" v-if="!item">
        <q-select
          class="col-12"
          emit-value
          v-if="!refItem"
          map-options
          label="Type"
          v-model="theDiscussion.type"
          :options="[
            { v: 'goal', t: 'Iteration Goal' },
            { v: 'objective', t: 'Goal Objective' },
            { v: 'story', t: 'Story' },
            { v: 'task', t: 'Task' },
          ]"
          option-value="v"
          option-label="t"
        />
        <q-badge v-else class="text-capitalize">{{
          theDiscussion.type
        }}</q-badge>
      </q-card-section>
      <q-card-section
        v-if="theDiscussion.type == 'goal' || theDiscussion.type == 'task'"
        class="row"
      >
        <q-input
          class="col-12"
          v-model="theDiscussion.description"
          type="textarea"
          label="Description"
        />
      </q-card-section>
      <q-card-section v-else-if="theDiscussion.type == 'objective'" class="row">
        <q-select
          class="col-12"
          emit-value
          label="Goal"
          map-options
          v-model="theDiscussion.goal"
          :options="discussions.filter((d) => d.type == 'goal')"
          :option-label="describeDiscussion"
          option-value="key"
        />
        <q-input
          class="col-12"
          v-model="theDiscussion.description"
          type="textarea"
          :rules="[(v) => (v && v.length > 0) || 'Enter Description']"
          label="Description"
        />
        <q-input
          class="col-6"
          v-model="theDiscussion.specifics"
          label="Specifics"
        />
        <q-input
          class="col-6"
          v-model="theDiscussion.mesures"
          label="Measures"
        />
        <q-input
          class="col-6"
          v-model="theDiscussion.enables"
          label="Enables"
        />
        <q-input
          class="col-6"
          filled
          v-model="theDiscussion.dueDate"
          mask="date"
          label="Due"
          :rules="['date']"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="theDiscussion.dueDate">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </q-card-section>
      <q-card-section v-else-if="theDiscussion.type == 'story'" class="row">
        <q-input
          class="col-6"
          v-model="theDiscussion.targetUser"
          label="As a"
        />
        <q-input
          class="col-6"
          v-model="theDiscussion.subject"
          label="I want to"
        />
        <q-input
          class="col-12"
          v-model="theDiscussion.purpose"
          label="So that"
        />
        <q-table
          class="col-12"
          :rows="theDiscussion.acceptanceCriteria"
          :columns="acceptanceCriteriaColumns"
        >
          <template v-slot:top>
            <q-btn
              icon="add"
              label="Add Acceptance Criteria"
              @click="dialogAcceptance = true"
            />
          </template>
        </q-table>
        <q-select
          class="col-12"
          emit-value
          label="Tasks"
          map-options
          v-model="theDiscussion.tasks"
          :options="discussions"
          :option-label="describeDiscussion"
          option-value="key"
        />
      </q-card-section>
      <q-card-actions :align="'right'">
        <q-btn icon="close" v-close-popup>Cancel</q-btn>
        <q-btn icon="save" :loading="saving" v-close-popup type="submit"
          >Save</q-btn
        >
      </q-card-actions>
    </q-form>
  </q-card>
  <q-dialog v-model="dialogAcceptance">
    <q-card v-if="newAcceptance">
      <q-card-section>
        <q-input v-model="newAcceptance.given" label="Given" />
        <q-input v-model="newAcceptance.when" label="When" />
        <q-input v-model="newAcceptance.then" label="Then" />
      </q-card-section>
      <q-card-actions>
        <q-btn icon="add" @click="addNewAccepatance">Add</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import {
  DiscussionItem,
  IAcceptanceCriteria,
  ICeremony,
  IIteration,
  IProject,
  IStory,
} from 'src/entities';
import { entityKey } from 'src/entities/base.entity';
import { getComponent } from 'src/modules/task-board/card-components';
import { useActiveStore } from 'src/stores/active.store';
import { useCeremonyStore } from 'src/stores/cermonies.store';
import { useConvoStore } from 'src/stores/convo.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useIterationStore } from 'src/stores/iterations.store';
import { useProfilesStore } from 'src/stores/profiles.store';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const activeStore = useActiveStore();
const profileStore = useProfilesStore();
const iterationStore = useIterationStore();
const ceremonyStore = useCeremonyStore();
const discussionStore = useDiscussionStore();
const convoStore = useConvoStore();
const props = defineProps<{
  item?: DiscussionItem;
  type?: DiscussionItem['type'];
  iteration?: IIteration;
  status?: string;
  projectKey?: string;
  refItem?: DiscussionItem;
}>();
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
const activeProjectKey = ref('AA1');
const activeProject = ref<IProject | undefined>();
const activeIterationKey = ref('');
const activeIteration = ref<IIteration | undefined>();
const activeCeremonyKey = ref('');
const activeCeremony = ref<ICeremony | undefined>();
const dialogAcceptance = ref(false);
const newAcceptance = ref<IAcceptanceCriteria | undefined>();
const saving = ref(false);
const theDiscussion = ref<DiscussionItem>(
  props.item ||
    ({
      type: props.type || 'task',
      projectKey: props.projectKey || props.refItem?.projectKey || '',
      iteration: props.iteration || props.refItem?.iteration || '',
      ceremonyKey: props.refItem?.ceremonyKey || '',
      status: props.status || props.refItem?.status || '',
      key: '',
      awareness: {},
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
});
function addNewAccepatance() {
  if (
    !newAcceptance?.value?.given ||
    !newAcceptance?.value?.when ||
    !newAcceptance?.value?.then
  ) {
    return;
  }
  const theDiscussion = props.item;
  if (theDiscussion?.type == 'story') {
    theDiscussion.acceptanceCriteria = theDiscussion.acceptanceCriteria || [];
    theDiscussion.acceptanceCriteria.push(newAcceptance.value);
    newAcceptance.value = {} as IAcceptanceCriteria;
    dialogAcceptance.value = false;
  }
}
function describeDiscussion(item: DiscussionItem) {
  return discussionStore.describeDiscussion(item);
}
const discussions = computed(() => {
  return discussionStore.discussions;
});

async function submitDiscussion() {
  saving.value = true;
  if (!props.item || !theDiscussion.value.key) {
    let counter = discussions.value.length;
    let key: string;
    do {
      key = activeProjectKey.value + theDiscussion.value.type + counter;
      counter++;
    } while (discussions.value.find((d) => d.key == key));
    theDiscussion.value.key = key;
  }
  theDiscussion.value.iteration =
    theDiscussion.value.iteration || activeIterationKey.value;
  theDiscussion.value.projectKey = activeProjectKey.value;
  if (props.refItem) {
    theDiscussion.value.parrent = entityKey(props.refItem);
  }
  await discussionStore.saveDiscussion(theDiscussion.value);

  if (activeCeremony.value) {
    activeCeremony.value.discussions.push(theDiscussion.value.key);
    await ceremonyStore.saveCeremony(activeCeremony.value);
  }
  if (
    activeProject.value &&
    profileStore.presentUser &&
    convoStore.convo.length
  ) {
    const report = discussionStore.checkCompleteness(
      theDiscussion.value,
      activeProject.value,
      convoStore.convo
    );
    if (theDiscussion.value.progress != report[0].progress) {
      convoStore.sendMessage(
        activeProjectKey.value,
        theDiscussion.value.key,
        'bot',
        {
          type: 'message',
          message: `${profileStore.presentUser.name} updated this ${
            theDiscussion.value.type
          } and progressed from ${(
            (theDiscussion.value.progress || 0) * 100
          ).toFixed(2)}% to ${(100 * (report[0].progress || 0)).toFixed(2)}%`,
        }
      );
    }
  }

  saving.value = false;
}
</script>
<style></style>
