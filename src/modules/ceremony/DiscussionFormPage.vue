<template>
  <q-page class="justify-evenly q-pa-sm">
    <q-form @submit="submitDiscussion">
      <q-card>
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
          <q-btn
            flat
            round
            dense
            icon="close"
            :to="`/${activeProjectKey}/${activeIterationKey}/${activeCeremonyKey}/${$route.params.item}`"
          />
        </q-toolbar>
        <q-card-section class="row" v-if="activeCeremony">
          <q-select
            :readonly="!!$route.params.item"
            class="col-12"
            emit-value
            map-options
            label="Type"
            v-model="theDiscussion.type"
            :options="
              activeCeremony.type == 'planning'
                ? [
                    { v: 'goal', t: 'Iteration Goal' },
                    { v: 'objective', t: 'Goal Objective' },
                    { v: 'story', t: 'Story' },
                    { v: 'task', t: 'Task' },
                  ]
                : activeCeremony.type == 'review'
                ? [
                    { v: 'report', t: 'Sprint Report' },
                    { v: 'demo', t: 'Demostration' },
                  ]
                : activeCeremony.type == 'retro'
                ? [
                    { v: 'went-well', t: 'What went well?' },
                    { v: 'went-wrong', t: 'What went wrong?' },
                    { v: 'to-improve', t: 'What to improve?' },
                    { v: 'action-item', t: 'Action Item' },
                  ]
                : [
                    { v: 'scrum', t: 'Scrum Report' },
                    { v: 'roadblock', t: 'Roadblock' },
                  ]
            "
            option-value="v"
            option-label="t"
          />
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
        <q-card-section
          v-else-if="theDiscussion.type == 'objective'"
          class="row"
        >
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
          <q-btn icon="save" :loading="saving" type="submit">Save</q-btn>
        </q-card-actions>
      </q-card>
    </q-form>
    <q-dialog v-model="dialogAcceptance">
      <q-card>
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
  </q-page>
</template>

<script lang="ts">
import { date } from 'quasar';
import {
  DiscussionItem,
  IAcceptanceCriteria,
  ICeremony,
  IIteration,
  IProject,
} from 'src/entities';
import { useCeremonyStore } from 'src/stores/cermonies.store';
import { useConvoStore } from 'src/stores/convo.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useIterationStore } from 'src/stores/iterations.store';
import { useProfilesStore } from 'src/stores/profiles.store';
import { useProjectStore } from 'src/stores/projects.store';
import { defineComponent } from 'vue';

const profileStore = useProfilesStore();
const projectStore = useProjectStore();
const iterationStore = useIterationStore();
const ceremonyStore = useCeremonyStore();
const discussionStore = useDiscussionStore();
const convoStore = useConvoStore();

export default defineComponent({
  name: 'DiscussionFormPage',
  components: {},
  data() {
    return {
      date: date,
      discuss: discussionStore,
      activeProjectKey: 'AA1',
      activeProject: undefined as IProject | undefined,
      activeIterationKey: '',
      activeIteration: undefined as IIteration | undefined,
      activeCeremonyKey: '',
      activeCeremony: undefined as ICeremony | undefined,
      theDiscussion: {} as DiscussionItem,
      dialogAcceptance: false,
      newAcceptance: {} as IAcceptanceCriteria,
      saving: false,
      acceptanceCriteriaColumns: [
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
      ],
    };
  },
  async mounted() {
    this.activeProjectKey =
      (this.$route.params.project && String(this.$route.params.project)) || '';
    this.activeProject = await projectStore.activeProject;

    this.activeIterationKey =
      (this.$route.params.iteration && String(this.$route.params.iteration)) ||
      '';
    this.activeIteration = iterationStore.activeIteration;

    this.activeCeremonyKey = this.$route.params.ceremony as string;
    this.activeCeremony = await ceremonyStore.withKey(
      this.activeProjectKey,
      this.activeIterationKey,
      this.activeCeremonyKey
    );
    this.theDiscussion =
      (await discussionStore.withKey(this.$route.params.item as string)) ||
      this.theDiscussion;
  },
  computed: {
    discussions() {
      return discussionStore.discussions;
    },
  },
  methods: {
    addNewAccepatance() {
      if (
        !this.newAcceptance.given ||
        !this.newAcceptance.when ||
        !this.newAcceptance.then
      ) {
        return;
      }
      if (this.theDiscussion.type == 'story') {
        this.theDiscussion.acceptanceCriteria =
          this.theDiscussion.acceptanceCriteria || [];
        this.theDiscussion.acceptanceCriteria.push(this.newAcceptance);
        this.newAcceptance = {} as IAcceptanceCriteria;
        this.dialogAcceptance = false;
      }
    },
    describeDiscussion(item: DiscussionItem) {
      return discussionStore.describeDiscussion(item);
    },
    async submitDiscussion() {
      this.saving = true;
      if (!this.$route.params.item) {
        let counter = this.discussions.length;
        let key: string;
        do {
          key = this.activeProjectKey + this.theDiscussion.type + counter;
          counter++;
        } while (this.discussions.find((d) => d.key == key));
        this.theDiscussion.key = key;
      }
      this.theDiscussion.iteration =
        this.theDiscussion.iteration || this.activeIterationKey;
      this.theDiscussion.projectKey = this.activeProjectKey;
      await discussionStore.saveDiscussion(this.theDiscussion);

      if (this.activeCeremony) {
        this.activeCeremony.discussions.push(this.theDiscussion.key);
        await ceremonyStore.saveCeremony(this.activeCeremony);
      }
      if (this.activeProject && profileStore.presentUser) {
        const report = discussionStore.checkCompleteness(
          this.theDiscussion,
          this.activeProject,
          convoStore.convo
        );
        if (this.theDiscussion.progress != report[0].progress) {
          convoStore.sendMessage(
            this.activeProjectKey,
            this.theDiscussion.key,
            'bot',
            {
              type: 'message',
              message: `${profileStore.presentUser.name} updated this ${
                this.theDiscussion.type
              } and progressed from ${(
                (this.theDiscussion.progress || 0) * 100
              ).toFixed(2)}% to ${(100 * (report[0].progress || 0)).toFixed(
                2
              )}%`,
            }
          );
        }
      }
      if (this.$route.params.item) {
        await this.$router.replace({
          name: 'discussionDetails',
          params: {
            project: this.activeProjectKey,
            iteration: this.activeIterationKey,
            ceremony: this.activeCeremonyKey,
            item: this.$route.params.item,
          },
        });
      } else {
        await this.$router.replace({
          name: 'ceremony',
          params: {
            project: this.activeProjectKey,
            iteration: this.activeIterationKey,
            ceremony: this.activeCeremonyKey,
          },
        });
      }
      this.saving = false;
    },
  },
});
</script>
<style></style>
