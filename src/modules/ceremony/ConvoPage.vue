<template>
  <q-page class="justify-evenly q-pa-sm">
    <!-- <q-scroll-area ref="scrollAreaRef" style="height: calc(100vh - 185px)"> -->
    <div style="width: 100%; margin-bottom: 80px">
      <div v-for="m in messages" :key="m.key" :id="m.key">
        <chat-message
          v-if="m.type == 'message'"
          :msg="m"
          :curr-user="profileStore.presentUser?.key"
          @reply-to="replyTo = m"
        />
        <chat-vote-message
          v-else-if="m.type == 'vote'"
          :msg="m"
          @reply-to="replyTo = m"
          :curr-user="profileStore.presentUser?.key"
          :reveal-votes="revealVotes"
        />
        <chat-question-message
          v-else-if="m.type == 'question'"
          :msg="m"
          @reply-to="replyTo = m"
          :curr-user="profileStore.presentUser?.key"
          :reveal-votes="revealVotes"
        />
        <chat-response-message
          v-else-if="m.type == 'response'"
          :msg="m"
          @reply-to="replyTo = m"
          :curr-user="profileStore.presentUser?.key"
          :href="
            activeProject +
            '/' +
            activeIteration +
            '/' +
            activeCeremony +
            '/' +
            activeItem +
            '/convo#'
          "
          :ref-msg="convoStore.getConvo(m.ref)"
        />
      </div>
      <div id="end-of-messages"></div>
    </div>
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
import { date } from 'quasar';
import ChatMessage from 'src/components/chat/ChatMessage.vue';
import ChatVoteMessage from 'src/components/chat/ChatVoteMessage.vue';
import ChatQuestionMessage from 'src/components/chat/ChatQuestionMessage.vue';
import ChatResponseMessage from 'src/components/chat/ChatResponseMessage.vue';
import {
  IIteration,
  IProject,
  ICeremony,
  Convo,
  DiscussionItem,
  IResponse,
  IVote,
} from 'src/entities';
import { useCeremonyStore } from 'src/stores/cermonies.store';
import { useConvoStore } from 'src/stores/convo.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useIterationStore } from 'src/stores/iterations.store';
import { useProfilesStore } from 'src/stores/profiles.store';
import { useProjectStore } from 'src/stores/projects.store';
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
  components: {
    ChatMessage,
    ChatVoteMessage,
    ChatQuestionMessage,
    ChatResponseMessage,
  },
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
      replyTo: undefined as Convo | undefined,
      timer: 0 as NodeJS.Timeout | 0,
      askingQuestion: false,
      confirmDisagreement: false,
      dialogVote: false,
      revealVotes: undefined as number | undefined,
    };
  },
  async mounted() {
    await this.init();
    convoBus.on('question', this.askQuestion);
    convoBus.on('vote', this.confirmVote);
    convoBus.on('disagree', this.confirmDisagree);
    convoBus.on('refresh', this.init);

    const elem = document.querySelector(this.$route.hash || '#end-of-messages');
    elem?.scrollIntoView();
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

  updated() {
    this.init();
  },
  computed: {
    messages() {
      return convoStore.convo;
    },
  },
  methods: {
    async init() {
      this.activeProject =
        (this.$route.params.project && String(this.$route.params.project)) ||
        '';
      this.project = await projectStore.activeProject;

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
      convoStore.ofDiscussion(
        this.activeProject,
        this.activeItem || this.activeCeremony
      );

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
        this.replyTo = undefined;
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
      convoBus.emit('progressed');
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
          .reduce(
            (p, c) => (typeof c.vote == 'undefined' ? [] : p.concat([c])),
            [] as IVote[]
          )
          .map((v) => v.vote)
          .sort()
          .reverse();
        const uniqueVotes = [...new Set(votes)];
        const voteCounts = uniqueVotes.reduce(
          (p, c) => p.concat([votes.filter((v) => v == c).length]),
          [] as number[]
        );
        const majorityVoteIndex = voteCounts.reduce(
          (p, c, index, self) =>
            c > 1 && (p < 0 || self[p] < c) ? index : self[p] == c ? -1 : p,
          -1
        );
        if (majorityVoteIndex >= 0) {
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
        } else if (uniqueVotes.length > 0) {
          const winningVote =
            uniqueVotes[Math.max(0, Math.round(uniqueVotes.length / 2) - 1)];
          await convoStore.sendMessage(
            this.activeProject,
            this.activeItem || this.activeCeremony,
            'bot',
            {
              type: 'message',
              message:
                'All votes are collected (' +
                uniqueVotes.map((v, i) => v + ':' + voteCounts[i]).join(', ') +
                ') with median of ' +
                winningVote,
            }
          );
          if (this.discussion) {
            this.discussion.complexity = Number(winningVote);
            await discussionStore.saveDiscussion(this.discussion);
          }
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
