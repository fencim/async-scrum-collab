<template>
  <base-chat-message :msg="msg" :curr-user="currUser" @reply-to="onReply">
    <div style="min-width: 150px" v-if="msg.type == 'vote'">
      <span v-html="msg.message"></span>
      <q-badge v-if="revealVotes" class="bg-green">{{ msg.vote }}</q-badge>
    </div>
  </base-chat-message>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import BaseChatMessage from './BaseChatMessage.vue';
import { Convo } from 'src/entities';

export default defineComponent({
  name: 'VoteChatMessage',
  components: { BaseChatMessage },
  emits: ['replyTo'],
  props: {
    msg: {
      type: Object as PropType<Convo>,
      required: true,
    },
    replyTo: {
      type: Object as PropType<Convo>,
    },
    currUser: {
      type: String,
    },
    revealVotes: {
      type: Number,
    },
  },
  methods: {
    onReply(m: Convo) {
      this.$emit('replyTo', m);
    },
  }, //methods
});
</script>

<style></style>
