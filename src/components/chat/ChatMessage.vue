<template>
  <base-chat-message :msg="msg" :curr-user="currUser" @reply-to="onReply">
    <div style="min-width: 120px"><span v-html="msg.message"></span></div>
  </base-chat-message>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import BaseChatMessage from './BaseChatMessage.vue';
import { Convo } from 'src/entities';

export default defineComponent({
  name: 'ChatMessage',
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
  },
  methods: {
    onReply(m: Convo) {
      this.$emit('replyTo', m);
    },
  }, //methods
});
</script>

<style></style>
