<template>
  <q-page class="justify-evenly q-pa-sm">
    <q-scroll-area ref="scrollAreaRef" style="height: calc(100vh - 185px)">
      <div style="width: 100%; margin-bottom: 80px">
        <div v-for="m in messages" :key="m.key" :id="m.key">
          <q-chat-message
            v-if="m.type == 'message' && typeof m.from == 'object'"
            :name="m.from.name"
            :avatar="m.from.avatar"
            :sent="m.from.key == profileStore.presentUser?.key"
          >
            <template v-slot:stamp>
              <div>
                <q-btn
                  @click="replyTo = m"
                  dense
                  color="primary"
                  flat
                  round
                  size="sm"
                  icon="reply"
                />
                {{ stampTime(m.date) }}
                <q-icon
                  :name="getStatus(m)"
                  class="absolute-bottom-right rounded-borders"
                  size="sm"
                />
              </div>
            </template>
            <div style="min-width: 120px">
              {{ m.message }}
            </div>
          </q-chat-message>
          <q-chat-message
            v-else-if="m.type == 'vote' && typeof m.from == 'object'"
            :name="m.from.name"
            :avatar="m.from.avatar"
            :sent="m.from.key == profileStore.presentUser?.key"
          >
            <template v-slot:stamp>
              <div>
                <q-btn
                  @click="replyTo = m"
                  dense
                  color="primary"
                  flat
                  round
                  size="sm"
                  icon="reply"
                />
                {{ stampTime(m.date) }}
                <q-icon
                  :name="getStatus(m)"
                  class="absolute-bottom-right rounded-borders"
                  size="sm"
                />
              </div>
            </template>
            <div style="min-width: 150px">
              {{ m.message }}
              <q-badge v-if="revealVotes == 1" class="bg-green">{{
                m.vote
              }}</q-badge>
            </div>
          </q-chat-message>
          <q-chat-message
            v-else-if="m.type == 'question' && typeof m.from == 'object'"
            :name="m.from.name"
            :avatar="m.from.avatar"
            :sent="m.from.key == profileStore.presentUser?.key"
          >
            <template v-slot:stamp>
              <div>
                <q-btn
                  @click="replyTo = m"
                  dense
                  color="primary"
                  flat
                  round
                  size="sm"
                  icon="reply"
                />
                {{ stampTime(m.date) }}
                <q-icon
                  :name="getStatus(m)"
                  class="absolute-bottom-right rounded-borders"
                  size="sm"
                />
              </div>
            </template>
            <div style="min-width: 150px">
              <q-icon v-if="m.resolved" name="check" size="sm" />
              {{ m.message }}
              <q-icon name="question_mark" size="sm" />
            </div>
          </q-chat-message>
          <q-chat-message
            v-else-if="m.type == 'response' && typeof m.from == 'object'"
            :name="m.from.name"
            :avatar="m.from.avatar"
            :sent="m.from.key == profileStore.presentUser?.key"
          >
            <template v-slot:stamp>
              <div>
                <q-btn
                  @click="replyTo = m"
                  dense
                  color="primary"
                  flat
                  round
                  size="sm"
                  icon="reply"
                />
                {{ stampTime(m.date) }}
                <q-icon
                  :name="getStatus(m)"
                  class="absolute-bottom-right rounded-borders"
                  size="sm"
                />
              </div>
            </template>
            <a
              style="min-width: 150px; text-decoration: none"
              class="text-grey-9 no"
              v-for="r in [convoStore.getConvo(m.ref)]"
              :key="r?.key"
              :href="
                activeProject +
                '/' +
                activeIteration +
                '/' +
                activeCeremony +
                '/' +
                activeItem +
                '/convo#' +
                r?.key
              "
            >
              <q-avatar size="sm" v-if="typeof r?.from == 'object'">
                <img :src="r?.from.avatar" />
              </q-avatar>
              &nbsp;
              {{ r?.message }}
              <q-icon
                name="question_mark"
                v-if="r?.type == 'question'"
                size="sm"
              />
              <q-icon name="reply" size="sm" />
            </a>
            <div style="min-width: 150px">
              <q-card class="bg-transparent text-dark no-shadow">
                <q-card-section horizontal>
                  <q-card-actions vertical align="right">
                    <q-btn
                      icon="thumb_up_alt"
                      size="sm"
                      flat
                      :color="
                        profileStore.presentUser &&
                        m.feedback &&
                        m.feedback[profileStore.presentUser.key] == 'agree'
                          ? 'primary'
                          : 'dark'
                      "
                      dense
                      @click="resolveQuestionOf(m, 'agree')"
                      ><q-tooltip>{{
                        Object.values(m.feedback).filter((m) => m == 'agree')
                          .length
                      }}</q-tooltip>
                    </q-btn>
                    <q-btn
                      icon="thumb_down_alt"
                      size="sm"
                      flat
                      :color="
                        profileStore.presentUser &&
                        m.feedback &&
                        m.feedback[profileStore.presentUser.key] == 'disagree'
                          ? 'primary'
                          : 'dark'
                      "
                      dense
                      @click="resolveQuestionOf(m, 'disagree')"
                    >
                      <q-tooltip>{{
                        Object.values(m.feedback).filter((m) => m == 'disagree')
                          .length
                      }}</q-tooltip>
                    </q-btn>
                  </q-card-actions>
                  <q-card-section>
                    {{ m.message }}
                  </q-card-section>
                </q-card-section>
              </q-card>
            </div>
          </q-chat-message>
        </div>
      </div>
    </q-scroll-area>
    <q-form @submit="sendMessage">
      <q-page-sticky expand position="bottom">
        <q-toolbar class="bg-grey-10" style="padding-right: 70px">
          <q-btn icon="poll " flat round />
          <q-btn icon="attachment" flat round />
          <q-toolbar-title class="q-pa-sm">
            <q-input
              autofocus
              v-model="message"
              rounded
              :label-slot="!!replyTo || confirmDisagreement"
            >
              <template v-slot:label>
                <q-avatar size="sm" v-if="typeof replyTo?.from == 'object'">
                  <img :src="replyTo?.from.avatar" />
                </q-avatar>
                <q-avatar size="sm" v-else-if="confirmDisagreement">
                  <q-icon name="thumb_down_alt" />
                </q-avatar>
                &nbsp;
                <span
                  v-if="replyTo && !confirmDisagreement"
                  class="text-weight-bold text-deep-orange"
                  >{{ replyTo?.message
                  }}<q-icon
                    name="question_mark"
                    v-if="replyTo?.type == 'question'"
                /></span>
                <span v-else>Why disagree?</span>
              </template>
              <template v-slot:append>
                <q-icon name="question_mark" v-if="askingQuestion" />
              </template>
            </q-input>
          </q-toolbar-title>
          <q-btn type="submit" icon="send" flat round />
        </q-toolbar>
      </q-page-sticky>
    </q-form>
    <q-dialog v-model="dialogVote">
      <q-card class="q-pa-sm text-center">
        <q-card-section class="text-right">
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-card
            @click="vote(c)"
            class="pocker-card bg-grey-9 q-pa-sm text-h5 cursor-pointer"
            v-for="c in ['1', '2', '3', '5', '8', '13', '21']"
            :key="c"
            v-ripple.early
          >
            <div class="top-left text-left">
              {{ c }}<br />
              <div style="color: black">♥</div>
            </div>
            <div></div>
            <div></div>
            <div></div>
            <div class="heart">♥</div>
            <div></div>
            <div></div>
            <div></div>
            <div class="bottom-right text-left">
              {{ c }}<br />
              <div style="color: black">♥</div>
            </div>
          </q-card>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { date, QScrollArea } from 'quasar';
import {
  IIteration,
  IProject,
  ICeremony,
  Convo,
  IProfile,
  DiscussionItem,
  IResponse,
  IVote,
} from 'src/entities';
import { useCeremonyStore } from 'src/stores/cermonies';
import { useConvoStore } from 'src/stores/convo';
import { useDiscussionStore } from 'src/stores/discussions';
import { useIterationStore } from 'src/stores/iterations';
import { useProfilesStore } from 'src/stores/profiles';
import { useProjectStore } from 'src/stores/projects';
import { defineComponent } from 'vue';
import { convoBus } from './convo-bus';

const profileStore = useProfilesStore();
const projectStore = useProjectStore();
const iterationStore = useIterationStore();
const ceremonyStore = useCeremonyStore();
const discussionStore = useDiscussionStore();
const convoStore = useConvoStore();

export default defineComponent({
  name: 'ConvoPage',
  components: {},
  data() {
    return {
      convoStore,
      profileStore,
      activeProject: 'AP',
      activeIteration: 'AI',
      activeCeremony: 'AC',
      activeItem: '0',
      message: '',
      project: undefined as IProject | undefined,
      iteration: undefined as IIteration | undefined,
      ceremony: undefined as ICeremony | undefined,
      discussion: undefined as DiscussionItem | undefined,
      messages: [] as Convo[],
      replyTo: undefined as Convo | undefined,
      timer: 0 as NodeJS.Timeout | 0,
      askingQuestion: false,
      confirmDisagreement: false,
      dialogVote: false,
      revealVotes: undefined as number | undefined,
    };
  },
  mounted() {
    this.init();
    this.timer = setInterval(() => this.updateMessages(), 1000);
    convoBus.on('question', this.askQuestion);
    convoBus.on('vote', this.confirmVote);
    convoBus.on('disagree', this.confirmDisagree);
    convoBus.on('refresh', this.init);
  },
  unmounted() {
    this.timer && clearInterval(this.timer);
    convoBus.off('question', this.askQuestion);
    convoBus.off('vote', this.confirmVote);
    convoBus.off('disagree', this.confirmVote);
    convoBus.off('refresh', this.init);
    convoBus.emit('onQuestion', false);
    convoBus.emit('onDisagree', false);
  },
  activated() {
    if (!this.$route.hash) {
      const scroll = this.$refs.scrollAreaRef as QScrollArea;

      scroll?.setScrollPosition(
        'vertical',
        scroll.getScrollTarget().scrollHeight,
        0
      );
    }
  },
  updated() {
    this.init();
  },

  methods: {
    async init() {
      this.activeProject =
        (this.$route.params.project && String(this.$route.params.project)) ||
        '';
      this.project = await projectStore.withKey(this.activeProject);

      this.activeIteration =
        (this.$route.params.iteration &&
          String(this.$route.params.iteration)) ||
        '';
      this.iteration = await iterationStore.withKey(
        this.activeProject,
        this.activeIteration
      );
      this.activeCeremony =
        (this.$route.params.ceremony && String(this.$route.params.ceremony)) ||
        '';
      this.ceremony = await ceremonyStore.withKey(
        this.activeProject,
        this.activeIteration,
        this.activeCeremony
      );

      this.activeItem =
        (this.$route.params.item && String(this.$route.params.item)) || '';
      this.discussion = await discussionStore.withKey(this.activeItem);
      if (this.$route.params.action == 'question') {
        this.askQuestion();
      } else if (this.$route.params.action == 'vote') {
        this.confirmVote();
      } else if (this.$route.params.action == 'disagree') {
        this.confirmDisagree();
      }
      this.assesItem();
    },
    async updateMessages() {
      this.messages = await Promise.all(
        (
          await convoStore.ofDiscussion(this.activeProject, this.activeItem)
        ).map(async (m) => {
          m.from = (await profileStore.get(m.from as string)) as IProfile;
          return m;
        })
      );
    },
    async sendMessage() {
      if (this.askingQuestion) {
        convoStore.sendMessage(
          this.activeProject,
          this.activeItem || this.activeCeremony,
          profileStore.presentUser?.key || '',
          {
            type: 'question',
            message: this.message,
          }
        );
        this.askQuestion(); //toggle question
      } else if (this.replyTo) {
        convoStore.sendMessage(
          this.activeProject,
          this.activeItem || this.activeCeremony,
          profileStore.presentUser?.key || '',
          { type: 'response', message: this.message, ref: this.replyTo.key }
        );
      } else if (this.confirmDisagreement && this.message.trim()) {
        convoStore.sendMessage(
          this.activeProject,
          this.activeItem || this.activeCeremony,
          profileStore.presentUser?.key || '',
          {
            type: 'question',
            message: 'I disagree because ' + this.message,
          }
        );
        if (this.discussion && profileStore.presentUser && this.project) {
          this.discussion.awareness = this.discussion.awareness || {};
          this.discussion.awareness[profileStore.presentUser.key] = 'disagree';
          await this.assesItem();
        }
        this.confirmDisagree(); //toggle
      } else {
        convoStore.sendMessage(
          this.activeProject,
          this.activeItem || this.activeCeremony,
          profileStore.presentUser?.key || '',
          { type: 'message', message: this.message }
        );
      }
      this.message = '';
    },
    stampTime(dateTime: string) {
      const now = new Date();
      const diffDays = date.getDateDiff(now, dateTime, 'days');
      const diffHours = date.getDateDiff(now, dateTime, 'hours');
      const diffMins = date.getDateDiff(now, dateTime, 'minutes');
      const diffSeconds = date.getDateDiff(now, dateTime, 'seconds');
      if (diffDays > 0) {
        return `${diffDays} days ago`;
      } else if (diffHours > 0) {
        return `${diffHours} hours ago`;
      } else if (diffMins > 0) {
        return `${diffMins} minutes ago`;
      } else {
        return `${diffSeconds} seconds ago`;
      }
      return dateTime;
    },
    getStatus(m: Convo) {
      switch (m.status) {
        case 'sent':
          return 'check_circle';
        default:
          return 'pending';
      }
    },
    askQuestion() {
      this.askingQuestion = !this.askingQuestion;
      convoBus.emit('onQuestion', this.askingQuestion);
    },
    confirmDisagree() {
      this.confirmDisagreement = !this.confirmDisagreement;
      convoBus.emit('onDisagree', this.confirmDisagreement);
    },
    confirmVote() {
      if (this.discussion) {
        this.dialogVote = true;
      } else {
        if (this.convoStore.convo.find((c) => c.type == 'poll')) {
          this.dialogVote = true;
        }
      }
    },
    async vote(vote: string) {
      if (this.discussion) {
        await convoStore.sendMessage(
          this.activeProject,
          this.activeItem || this.activeCeremony,
          profileStore.presentUser?.key || '',
          {
            type: 'vote',
            vote: vote,
            ref: 'ticket:' + this.activeItem,
            message: 'I voted for this ticket',
          }
        );
      }
      const report = await this.assesItem();
      const voteReport = report && report.find((r) => r.factor == 'votes');
      if (voteReport && voteReport.progress >= 1) {
        const voteCasts = this.convoStore.convo.filter(
          (v) => v.type == 'vote'
        ) as IVote[];
        const votes = voteCasts
          .map((v) => v.vote)
          .sort()
          .reverse();
        const uniqueVotes = [...new Set(votes)];
        const voteCounts = uniqueVotes.reduce(
          (p, c) => p.concat([votes.filter((v) => v == c).length]),
          [] as number[]
        );
        const majorityVoteIndex = voteCounts.reduce(
          (p, c, index, self) => (c > 1 && (p < 0 || self[p] < c) ? index : p),
          -1
        );
        const winningVote = uniqueVotes[majorityVoteIndex];
        await convoStore.sendMessage(
          this.activeProject,
          this.activeItem || this.activeCeremony,
          'bot',
          {
            type: 'message',
            message:
              'All votes are collected (' +
              uniqueVotes.map((v, i) => v + ':' + voteCounts[i]).join(', ') +
              ') with majority of ' +
              winningVote,
          }
        );

        if (this.discussion) {
          this.discussion.complexity = Number(winningVote);
          await discussionStore.saveDiscussion(this.discussion);
        }
      }
      this.dialogVote = false;
    },
    async assesItem() {
      if (this.discussion && this.project) {
        const report = discussionStore.checkCompleteness(
          this.discussion,
          this.project,
          this.convoStore.convo
        );
        if (this.discussion.progress != report[0].progress) {
          this.discussion.progress = report[0].progress;
          await discussionStore.saveDiscussion(this.discussion);
        }
        this.revealVotes = this.discussion.complexity;
        return report;
      }
    },
    async resolveQuestionOf(msg: IResponse, resolution: 'agree' | 'disagree') {
      if (profileStore.presentUser) {
        msg.feedback = { ...msg.feedback } || {};
        msg.feedback[profileStore.presentUser?.key] = resolution;
        await convoStore.saveConvo({ ...msg });

        let qMsg = this.messages.find((m) => m.key == msg.ref);
        while (qMsg && qMsg.type != 'question' && resolution == 'agree') {
          if (qMsg.type == 'response' && qMsg.ref) {
            const ref = qMsg.ref;
            qMsg = this.messages.find((m) => m.key == ref);
          } else {
            qMsg = undefined;
          }
        }
        if (qMsg && qMsg.type == 'question' && resolution == 'agree') {
          qMsg.resolved = true;
          await convoStore.saveConvo({ ...qMsg });
        }
      }
    },
  },
});
</script>
<style lang="sass" scoped>
.pocker-card
  display: inline-block
  margin: 5px
  min-width: 100px
.heart
  text-align: center
  align-self: center
  font-size: 2em
  color: black
.top-left
  padding: 0.1em
.bottom-right
  align-self: end
  transform: rotate(180deg)
</style>
