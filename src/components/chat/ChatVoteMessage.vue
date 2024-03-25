<template>
  <base-chat-message :msg="msg" :curr-user="currUser" @reply-to="onReply">
    <div style="min-width: 150px" v-if="msg.type == 'vote'">
      <span v-html="msg.message"></span>
      <q-badge v-if="revealVotes || showVote" class="q-ml-xs bg-green">{{
        msg.vote
      }}</q-badge>
      <q-toggle
        dense
        class="q-ml-xs"
        v-else-if="activeStore.canUserModerate"
        v-model="showVote"
        icon="poll"
      />
      <q-icon name="show"></q-icon>
    </div>
  </base-chat-message>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import BaseChatMessage from './BaseChatMessage.vue';
import { Convo } from 'src/entities';
import { useActiveStore } from 'src/stores/active.store';
const activeStore = useActiveStore();
const $emit = defineEmits(['replyTo']);
defineProps<{
  msg: Convo;
  replyTo: Convo;
  currUser: string;
  revealVotes: number;
}>();
const showVote = ref(false);
function onReply(m: Convo) {
  $emit('replyTo', m);
}
</script>

<style></style>
