<template>
  <q-page class="justify-evenly q-pa-sm">
    <q-card>
      <q-toolbar>
        <q-avatar>
          <img :src="activeProject?.icon" />
        </q-avatar>

        <q-toolbar-title>
          Discussion item of {{ activeProject?.name }}</q-toolbar-title
        >
        <q-btn
          flat
          round
          dense
          icon="edit"
          :to="`/${activeProjectKey}/${activeIterationKey}/${activeCeremonyKey}/${activeItemKey}/edit`"
        />
      </q-toolbar>
      <q-card-section horizontal>
        <q-card-section>
          {{ describeDiscussion(theDiscussion) }}
        </q-card-section>
        <q-card-section v-if="theDiscussion.complexity !== undefined">
          <q-badge class="text-h3">{{ theDiscussion.complexity }}</q-badge>
          <q-btn icon="refresh" dense round flat @click="resetVoting()">
            <q-tooltip>Reset Voting</q-tooltip>
          </q-btn>
        </q-card-section>
      </q-card-section>
      <q-card-section
        v-if="theDiscussion.type == 'goal' || theDiscussion.type == 'task'"
        class="row"
      >
        {{ theDiscussion.description }}
      </q-card-section>
      <q-card-section v-else-if="theDiscussion.type == 'objective'" class="row">
        <div class="col-12">
          <strong>Description:</strong> {{ theDiscussion.description }}
        </div>
        <div class="col-12">
          <strong>Specifics:</strong> {{ theDiscussion.specifics }}
        </div>
        <div class="col-12">
          <strong>Measures:</strong> {{ theDiscussion.mesures }}
        </div>
        <div class="col-12">
          <strong>Enables:</strong> {{ theDiscussion.enables }}
        </div>
        <div class="col-12">
          <strong>Due:</strong>
          {{ date.formatDate(theDiscussion.due, 'MMM D, YYYY') }}
        </div>
      </q-card-section>
      <q-card-section v-else-if="theDiscussion.type == 'story'" class="row">
        {{ theDiscussion.targetUser }}
        {{ theDiscussion.subject }}
        {{ theDiscussion.purpose }}

        <q-table
          title="Acceptance Criteria"
          class="col-12"
          :rows="theDiscussion.acceptanceCriteria"
          :columns="acceptanceCriteriaColumns"
        >
        </q-table>
        <q-table
          v-if="subTasks && subTasks.length"
          title="Sub-Tasks"
          class="col-12"
          :rows="subTasks"
        >
        </q-table>
      </q-card-section>
      <q-card-section horizontal>
        <q-card-section>
          Agreed
          <recent-active-members :profiles="membersAgreed" />
        </q-card-section>
        <q-card-section>
          Disgreed
          <recent-active-members :profiles="membersDisagreed" />
        </q-card-section>
        <q-card-section>
          Pending
          <recent-active-members :profiles="membersPending" />
        </q-card-section>
        <q-card-section>
          Voted
          <recent-active-members :profiles="membersVoted" />
        </q-card-section>
      </q-card-section>
      <q-card-section>
        <q-table
          title="Progress"
          :rows="progressReport"
          grid
          :rows-per-page-options="[0]"
        >
          <template v-slot:item="props">
            <div class="q-pa-xs col-12">
              <q-card
                v-for="row in [asProgress(props.row)]"
                :key="row.feedback"
              >
                <q-card-section>
                  <div
                    class="text-bold"
                    :class="
                      /\b(only|no|not)\b/i.test(line) ? 'text-negative' : ''
                    "
                    v-for="line in row.feedback.split('\n')"
                    :key="line"
                  >
                    {{ line }}
                  </div>
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <q-linear-progress instant-feedback :value="row.progress" />
                </q-card-section>
              </q-card>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { date } from 'quasar';
import {
  DiscussionItem,
  IAcceptanceCriteria,
  ICeremony,
  IIteration,
  IProfile,
  IProject,
} from 'src/entities';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { useCeremonyStore } from 'src/stores/cermonies';
import { useConvoStore } from 'src/stores/convo';
import { useDiscussionStore } from 'src/stores/discussions';
import { useIterationStore } from 'src/stores/iterations';
import { useProfilesStore } from 'src/stores/profiles';
import { useProjectStore } from 'src/stores/projects';
import { defineComponent } from 'vue';
import { convoBus } from './convo-bus';

const projectStore = useProjectStore();
const profileStore = useProfilesStore();
const iterationStore = useIterationStore();
const ceremonyStore = useCeremonyStore();
const discussionStore = useDiscussionStore();
const convoStore = useConvoStore();

export default defineComponent({
  name: 'DiscussionFormPage',
  components: { RecentActiveMembers },
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
      activeItemKey: '0',
      activeItem: undefined as DiscussionItem | undefined,
      discussions: [] as DiscussionItem[],
      subTasks: [] as DiscussionItem[],
      theDiscussion: {} as DiscussionItem,
      membersAgreed: [] as IProfile[],
      membersDisagreed: [] as IProfile[],
      membersPending: [] as IProfile[],
      membersVoted: [] as IProfile[],
      progressReport: [] as { progress: number; feedback: string }[],
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
    await this.init();
    convoBus.on('question', () => this.doAction('question'));
    convoBus.on('vote', () => this.doAction('vote'));
    convoBus.on('disagree', () => this.doAction('disagree'));
    convoBus.on('refresh', this.init);
  },
  async updated() {
    await this.init();
  },
  unmounted() {
    convoBus.off('question');
    convoBus.off('vote');
    convoBus.off('refresh', this.init);
  },
  computed: {},
  methods: {
    async init() {
      this.activeProjectKey =
        (this.$route.params.project && String(this.$route.params.project)) ||
        '';
      this.activeProject = await projectStore.withKey(this.activeProjectKey);

      this.activeIterationKey =
        (this.$route.params.iteration &&
          String(this.$route.params.iteration)) ||
        '';
      this.activeIteration = await iterationStore.withKey(
        this.activeProjectKey,
        this.activeIterationKey
      );

      this.discussions = await discussionStore.ofProject(this.activeProjectKey);

      this.activeCeremonyKey = this.$route.params.ceremony as string;
      this.activeCeremony = await ceremonyStore.withKey(
        this.activeProjectKey,
        this.activeIterationKey,
        this.activeCeremonyKey
      );

      this.activeItemKey = this.$route.params.item as string;
      this.theDiscussion =
        (await discussionStore.withKey(this.activeItemKey)) ||
        this.theDiscussion;
      if (this.theDiscussion && this.theDiscussion.type == 'story') {
        this.subTasks = await discussionStore.fromKeyList(
          this.activeProjectKey,
          (this.theDiscussion.tasks as string[]) || []
        );
      }
      await this.revealAwareMembers();

      await this.assesItem();
    },
    async revealAwareMembers() {
      if (this.theDiscussion) {
        const awareness = this.theDiscussion.awareness || {};
        const awareMembers = Object.keys(awareness);
        this.membersAgreed = await profileStore.fromKeyList(
          awareMembers.filter((m) => awareness[m] == 'agree')
        );
        this.membersDisagreed = await profileStore.fromKeyList(
          awareMembers.filter((m) => awareness[m] == 'disagree')
        );
        this.membersPending = await profileStore.fromKeyList(
          (this.activeProject?.members || []).filter(
            (m) => !awareMembers.includes(m)
          )
        );
      }
    },
    async assesItem(forceSave?: boolean) {
      if (this.theDiscussion && this.activeProject) {
        const convo = await convoStore.ofDiscussion(
          this.activeProjectKey,
          this.theDiscussion.key
        );
        const report = discussionStore.checkCompleteness(
          this.theDiscussion,
          this.activeProject,
          convo
        );
        this.membersVoted = await profileStore.fromKeyList([
          ...new Set(
            convo.filter((c) => c.type == 'vote').map((c) => c.from as string)
          ),
        ]);
        this.progressReport = report;
        if (this.theDiscussion.progress != report[0].progress || forceSave) {
          this.theDiscussion.progress = report[0].progress;
          await discussionStore.saveDiscussion(this.theDiscussion);
        }
      }
    },
    describeDiscussion(item: DiscussionItem) {
      return discussionStore.describeDiscussion(item);
    },
    async doAction(action: string) {
      await this.$router.replace({
        name: 'convo',
        params: {
          project: this.activeProjectKey,
          iteration: this.activeIterationKey,
          ceremony: this.activeCeremonyKey,
          item: this.activeItemKey,
          action: action,
        },
      });
    },
    asProgress(progress: { progress: number; feedback: string }) {
      return progress;
    },
    async resetVoting(complexity?: number) {
      if (this.theDiscussion && profileStore.presentUser) {
        this.theDiscussion.complexity = complexity;
        await this.assesItem(true);
        if (typeof complexity == 'undefined') {
          convoStore.sendMessage(
            this.activeProjectKey,
            this.activeItemKey,
            profileStore.presentUser.key,
            {
              type: 'vote',
              vote: undefined,
              message: 'Reseting all votes',
            }
          );
        }
      }
    },
  },
});
</script>
<style></style>
