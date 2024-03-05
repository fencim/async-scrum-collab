<template>
  <q-page class="justify-between q-pa-sm column q-pb-xl">
    <q-infinite-scroll
      @load="(i, done) => done()"
      reverse
      id="messages-container"
    >
      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner color="primary" name="dots" size="40px" />
        </div>
      </template>

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
        />
        <chat-response-message
          v-else-if="m.type == 'response'"
          :msg="m"
          @reply-to="replyTo = m"
          :curr-user="profileStore.presentUser?.key"
          @resolve-question="resolveQuestionOf"
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
          :ref-msg="convoStore.getConvo(m.ref, activeIteration)"
        />
        <chat-retro-feedback-message
          v-else-if="m.type == 'retro-feedback'"
          :msg="m"
          :item="discussion || ceremony"
          @reply-to="replyTo = m"
          :curr-user="profileStore.presentUser?.key"
        />
        <chat-reaction-message
          v-else-if="m.type == 'reaction'"
          :msg="m"
          :item="discussion || ceremony"
          @reply-to="replyTo = m"
          :curr-user="profileStore.presentUser?.key"
        />
      </div>
      <div id="end-of-messages" class="text-center text-grey">&nbsp;</div>
    </q-infinite-scroll>
    <chat-message-form
      id="input-message"
      :message="message"
      :asking-question="askingQuestion"
      :reply-to="replyTo"
      @send-message="sendMessage"
      @update:message="(e) => (message = e)"
      @update:asking-question="(e) => (askingQuestion = e)"
    >
    </chat-message-form>
  </q-page>
</template>

<script lang="ts" setup>
import ChatMessage from 'src/components/chat/ChatMessage.vue';
import ChatVoteMessage from 'src/components/chat/ChatVoteMessage.vue';
import ChatQuestionMessage from 'src/components/chat/ChatQuestionMessage.vue';
import ChatResponseMessage from 'src/components/chat/ChatResponseMessage.vue';
import ChatReactionMessage from 'src/components/chat/ChatReactionMessage.vue';
import ChatRetroFeedbackMessage from 'src/components/chat/ChatRetroFeedbackMessage.vue';
import ChatMessageForm from 'src/components/chat/ChatMessageForm.vue';
import {
  IIteration,
  IProject,
  ICeremony,
  Convo,
  DiscussionItem,
  IResponse,
} from 'src/entities';
import { useCeremonyStore } from 'src/stores/ceremonies.store';
import { useConvoStore } from 'src/stores/convo.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useIterationStore } from 'src/stores/iterations.store';
import { useProfilesStore } from 'src/stores/profiles.store';
import { useProjectStore } from 'src/stores/projects.store';
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  onUpdated,
  ref,
} from 'vue';
import { convoBus } from './convo-bus';
import { TheWorkflows } from 'src/workflows/the-workflows';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';

const profileStore = useProfilesStore();
const projectStore = useProjectStore();
const iterationStore = useIterationStore();
const ceremonyStore = useCeremonyStore();
const discussionStore = useDiscussionStore();
const convoStore = useConvoStore();
const $route = useRoute();
const $q = useQuasar();

const activeProject = ref('AP');
const activeIteration = ref('AI');
const activeCeremony = ref('AC');
const activeItem = ref('0');
const message = ref('');
const project = ref<IProject>();
const iteration = ref<IIteration>();
const ceremony = ref<ICeremony>();
const discussion = ref<DiscussionItem>();
const replyTo = ref<Convo>();
const timer = ref<NodeJS.Timeout | number>(0);
const askingQuestion = ref(false);
const revealVotes = computed(() => {
  if (discussion.value) {
    return discussion.value?.complexity;
  } else {
    return ceremony.value?.confidence;
  }
});

onMounted(async () => {
  await init();
  convoBus.on('question', askQuestion);
  convoBus.on('refresh', init);
  scrollToBottom();
});
onUnmounted(() => {
  timer.value && clearInterval(timer.value);
  convoBus.off('question', askQuestion);
  convoBus.off('refresh', init);
  convoBus.emit('onQuestion', false);
  convoBus.emit('onDisagree', false);
});
onUpdated(async () => {
  await init();
  await nextTick();
  scrollToBottom();
});

const messages = computed(() => {
  const convo = convoStore.convo[activeIteration.value ?? ''] || [];
  if (discussion.value) {
    const msgs = convo.filter((m) => m.discussion == discussion.value?.key);
    if (ceremony.value?.type == 'retro') {
      return msgs.filter((m) => m.type != 'retro-feedback' || !m.groupWith);
    }
    return msgs;
  }
  if (ceremony.value?.type == 'planning') {
    return convo.filter((m) => m.discussion == `${iteration.value?.key}plan`);
  } else {
    return convo.filter((m) => m.discussion == `${ceremony.value?.key || ''}`);
  }
  return [];
});

async function init() {
  activeProject.value =
    ($route.params.project && String($route.params.project)) || '';
  project.value = projectStore.activeProject;

  activeIteration.value =
    ($route.params.iteration && String($route.params.iteration)) || '';
  iteration.value = iterationStore.activeIteration;
  activeCeremony.value =
    ($route.params.ceremony && String($route.params.ceremony)) || '';
  ceremony.value = await ceremonyStore.withKey(
    activeProject.value,
    activeIteration.value,
    activeCeremony.value
  );
  activeItem.value = ($route.params.item && String($route.params.item)) || '';
  discussion.value = await discussionStore.withKey(activeItem.value);
  // await assesItem();
}
async function sendMessage() {
  const item = discussion.value || ceremony.value;
  if (askingQuestion.value && item) {
    TheWorkflows.emit({
      type: 'askQuestion',
      arg: {
        item: item,
        message: message.value,
        done: () => {
          askQuestion(); //toggle question
        },
      },
    });
  } else if (replyTo.value && item) {
    TheWorkflows.emit({
      type: 'replyToMessage',
      arg: {
        item,
        message: message.value,
        ref: replyTo.value,
        done: () => {
          replyTo.value = undefined;
        },
      },
    });
  } else if (message.value && ceremony.value?.type == 'retro') {
    await TheWorkflows.emitPromised({
      type: 'retroFeedback',
      arg: {
        discussion: activeItem.value || activeCeremony.value,
        iteration: activeIteration.value,
        message: message.value,
      },
    });
  } else if (message.value) {
    await TheWorkflows.emitPromised({
      type: 'sendMessage',
      arg: {
        discussion: activeItem.value || activeCeremony.value,
        iteration: activeIteration.value,
        message: message.value,
      },
    });
  }
  message.value = '';
  convoBus.emit('progressed');
}
function scrollToBottom() {
  const scrollTo = () => {
    const elem = document.getElementById(
      $route.hash.replace('#', '') || 'input-message'
    );
    if (!elem) setTimeout(scrollTo, 100);
    elem?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'end',
    });
  };
  scrollTo();
}

function askQuestion() {
  askingQuestion.value = !askingQuestion.value;
  convoBus.emit('onQuestion', askingQuestion);
}

async function resolveQuestionOf(
  msg: IResponse,
  resolution: 'agree' | 'disagree'
) {
  const item = discussion.value || ceremony.value;
  if (!item) return;
  TheWorkflows.emit({
    type: 'resolveQuestionOf',
    arg: {
      item,
      message: msg,
      resolution,
      done: () => {
        $q.notify({
          message: 'A Question is resolved',
          color: 'positive',
          icon: 'info',
        });
      },
      error: (e) => {
        $q.notify({
          message: String(e),
          color: 'negative',
          icon: 'error',
        });
      },
    },
  });
}
</script>
