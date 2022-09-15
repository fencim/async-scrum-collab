<template>
  <base-chat-message :msg="msg" :curr-user="currUser" @reply-to="onReply">
    <div style="min-width: 150px" v-if="msg.type == 'question'">
      <q-icon v-if="msg.resolved" name="check" size="sm" />
      {{ msg.message }}
      <q-icon name="question_mark" size="sm" />
    </div>
  </base-chat-message>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import BaseChatMessage from './BaseChatMessage.vue';
import { Convo } from 'src/entities';

export default defineComponent({
  name: 'ChatQuestionMessage',
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
