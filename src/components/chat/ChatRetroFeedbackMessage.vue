<template>
  <base-chat-message
    :msg="msg"
    :curr-user="currUser"
    @reply-to="$emit('replyTo', msg)"
  >
    <div style="min-width: 150px">
      <q-icon name="campaign" />
      <span v-html="msg.message"></span>
      <q-btn flat dense rounded icon="call_merge" v-if="groupWith.length == 0">
        <q-tooltip>Group with ...</q-tooltip>
        <q-popup-proxy transition-show="flip-up" transition-hide="flip-down">
          <q-list>
            <q-item
              clickable
              v-close-popup
              v-for="m in baseFeedbacks"
              :key="m.key"
              @click="mergeWith(m.key)"
            >
              <q-item-section avatar><q-icon name="message" /></q-item-section>
              <q-item-section>
                <span v-html="m.message"></span>
              </q-item-section>
            </q-item>
          </q-list>
        </q-popup-proxy>
      </q-btn>
      <q-chip color="info" v-else>
        {{ groupWith.length }}
        <q-popup-proxy>
          <q-list>
            <q-item clickable v-close-popup v-for="m in groupWith" :key="m.key">
              <q-item-section avatar><q-icon name="message" /></q-item-section>
              <q-item-section> <span v-html="m.message"></span></q-item-section>
            </q-item>
          </q-list>
        </q-popup-proxy>
      </q-chip>
    </div>
  </base-chat-message>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import BaseChatMessage from './BaseChatMessage.vue';
import { Convo, DiscussionItem, ICeremony, IRetroFeedback } from 'src/entities';
import { useConvoStore } from 'src/stores/convo.store';
import { TheWorkflows } from 'src/workflows/the-workflows';
const convoStore = useConvoStore();
const props = defineProps<{
  msg: Convo;
  currUser?: string;
  item?: DiscussionItem | ICeremony;
}>();
defineEmits(['replyTo']);
const baseFeedbacks = computed(() => {
  const convo = convoStore.convo[props.msg.iteration];
  return convo.filter(
    (c) =>
      c.key != props.msg.key &&
      c.discussion == props.msg.discussion &&
      c.type == 'retro-feedback' &&
      !c.groupWith
  );
});
const groupWith = computed(() => {
  const convo = convoStore.convo[props.msg.iteration];
  return convo.filter(
    (c) =>
      c.key != props.msg.key &&
      c.discussion == props.msg.discussion &&
      c.type == 'retro-feedback' &&
      c.groupWith == props.msg.key
  );
});
function mergeWith(key: string) {
  if (!props.item) return;
  return TheWorkflows.emitPromised({
    type: 'mergeFeedbackWith',
    arg: {
      message: props.msg as IRetroFeedback,
      item: props.item,
      withMsg: key,
    },
  });
}
</script>

<style></style>
