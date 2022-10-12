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
          <recent-active-members sizes="xs" :profiles="membersAgreed" />
        </q-card-section>
        <q-card-section>
          Disgreed
          <recent-active-members sizes="xs" :profiles="membersDisagreed" />
        </q-card-section>
        <q-card-section>
          Pending
          <recent-active-members sizes="xs" :profiles="membersPending" />
        </q-card-section>
        <q-card-section>
          Voted
          <recent-active-members sizes="xs" :profiles="membersVoted" />
        </q-card-section>
        <q-card-section>
          Unresolved
          <div>
            <q-btn
              round
              size="xs"
              v-for="q in unResolvedQuestions"
              :key="q.key"
              :to="{
                name: 'convo',
                params: {
                  project: activeProjectKey,
                  iteration: activeIterationKey,
                  ceremony: activeCeremonyKey,
                  item: activeItemKey,
                },
                hash: '#' + q.key,
              }"
            >
              <q-avatar size="xs">
                <img v-if="typeof q.from == 'object'" :src="q.from.avatar" />
                <q-icon v-else name="question_mark" />
              </q-avatar>
              <q-tooltip>{{ q.message }}?</q-tooltip>
            </q-btn>
          </div>
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
  ConvoList,
  DiscussionItem,
  IAcceptanceCriteria,
  ICeremony,
  IIteration,
  IProfile,
  IProject,
  IVote,
} from 'src/entities';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { useCeremonyStore } from 'src/stores/cermonies.store';
import { useConvoStore } from 'src/stores/convo.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useIterationStore } from 'src/stores/iterations.store';
import { useProfilesStore } from 'src/stores/profiles.store';
import { useProjectStore } from 'src/stores/projects.store';
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
  computed: {
    discussions() {
      return discussionStore.discussions;
    },
    convo() {
      return convoStore.convo;
    },
    unResolvedQuestions(): ConvoList {
      return this.convo
        .filter((c) => c.type == 'question' && !c.resolved)
        .map((c) => {
          c.from =
            this.membersPending.find((m) => m.key == String(c.from)) ||
            this.membersAgreed.find((m) => m.key == String(c.from)) ||
            this.membersDisagreed.find((m) => m.key == String(c.from)) ||
            c.from;
          return c;
        });
    },
  },
  methods: {
    async init() {
      this.activeProjectKey =
        (this.$route.params.project && String(this.$route.params.project)) ||
        '';
      this.activeProject = projectStore.activeProject;

      this.activeIterationKey =
        (this.$route.params.iteration &&
          String(this.$route.params.iteration)) ||
        '';
      this.activeIteration = iterationStore.activeIteration;

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
        this.membersAgreed = profileStore.members.filter(
          (m) => awareness[m.key] == 'agree'
        );
        this.membersDisagreed = profileStore.members.filter(
          (m) => awareness[m.key] == 'disagree'
        );

        this.membersPending = profileStore.members.filter(
          (m) => !awareMembers.includes(m.key)
        );
      }
    },
    async assesItem() {
      if (this.theDiscussion && this.activeProject) {
        const report = discussionStore.checkCompleteness(
          this.theDiscussion,
          this.activeProject,
          this.convo
        );
        const voted = [
          ...new Set(
            (this.convo.filter((c) => c.type == 'vote') as IVote[])
              .reduce(
                (p, c) => (typeof c.vote == 'undefined' ? [] : p.concat([c])),
                [] as IVote[]
              )
              .map((c) => c.from as string)
          ),
        ];
        this.membersVoted = profileStore.members.filter((m) =>
          voted.includes(m.key)
        );
        this.progressReport = report;
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
        await this.assesItem();
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
