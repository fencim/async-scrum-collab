<template>
  <q-page class="justify-evenly q-pa-sm">
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
              '/#' +
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
            {{ m.message }}
          </div>
        </q-chat-message>
      </div>

      <!-- <q-chat-message
        name="bot"
        avatar="icons/bot2.png"
        :text="['Acceptance Criteria (AC) was updated by @PO']"
        stamp="7 minutes ago"
      />
      <q-chat-message
        name="bot"
        avatar="icons/bot2.png"
        text-html
        :text="['You may now vote <strong>SP</strong> estimates.']"
        stamp="7 minutes ago"
      />
      <q-chat-message
        name="me"
        avatar="icons/avatar4.jpg"
        text-html
        :text="[`I will vote for this ticket for ... points.`]"
        sent
        stamp="7 minutes ago"
      />
      <q-chat-message
        name="Jane"
        avatar="icons/avatar3.jpg"
        :text="[`I will vote for this ticket for ... points.`]"
        stamp="4 minutes ago"
      />
      <q-chat-message
        name="Jane"
        avatar="icons/avatar3.jpg"
        stamp="4 minutes ago"
      >
        <div>
          <q-btn icon="play_arrow" flat size="lg" round dense />
          <q-badge color="black" class="q-mx-xs" />
          <q-badge color="black" class="q-mx-xs" />
          <q-badge color="black" class="q-mx-xs" />
          <span class="text-title">09:00</span>
          <q-badge color="transparent">
            <q-icon name="question_mark" color="white" size="sm" />
          </q-badge>
        </div>
      </q-chat-message>
      <q-chat-message
        name="Jane"
        avatar="icons/avatar2.jpg"
        :text="[`I will vote for this ticket for ... points.`]"
        stamp="4 minutes ago"
      />
      <q-chat-message
        name="Sarah"
        avatar="icons/avatar5.jpg"
        :text="[`I will vote for this ticket for ... points.`]"
        stamp="4 minutes ago"
      /> -->
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
              :label-slot="!!replyTo"
            >
              <template v-slot:label>
                <q-avatar size="sm" v-if="typeof replyTo?.from == 'object'">
                  <img :src="replyTo?.from.avatar" />
                </q-avatar>
                &nbsp;
                <span class="text-weight-bold text-deep-orange"
                  >{{ replyTo?.message
                  }}<q-icon
                    name="question_mark"
                    v-if="replyTo?.type == 'question'"
                /></span>
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
import {
  IIteration,
  IProject,
  ICeremony,
  Convo,
  IProfile,
  DiscussionItem,
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
const discusssionStore = useDiscussionStore();
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
      dialogVote: false,
    };
  },
  mounted() {
    this.init();
    this.timer = setInterval(() => this.updateMessages(), 1000);
    convoBus.on('question', this.askQuestion);
    convoBus.on('vote', this.confirmVote);
  },
  unmounted() {
    this.timer && clearInterval(this.timer);
    convoBus.off('question', this.askQuestion);
    convoBus.off('vote', this.confirmVote);
    convoBus.emit('onQuestion', false);
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
      this.discussion = await discusssionStore.withKey(this.activeItem);
      if (this.$route.params.action == 'question') {
        this.askQuestion();
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
      await this.assesItem();
      this.dialogVote = false;
    },
    async assesItem() {
      if (this.discussion && this.project) {
        const report = discusssionStore.checkCompleteness(
          this.discussion,
          this.project,
          this.convoStore.convo
        );
        if (this.discussion.progress != report[0].progress) {
          this.discussion.progress = report[0].progress;
          await discusssionStore.saveDiscussion(this.discussion);
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
