<template>
  <base-chat-message
    :msg="msg"
    :curr-user="currUser"
    @reply-to="$emit('replyTo', msg)"
  >
    <div style="min-width: 150px" v-if="msg.type == 'reaction'">
      <span v-html="msg.message"></span>
      <q-icon name="thumb_up" v-if="msg.reaction == 'agree'" />
      <q-icon name="thumb_down" v-else-if="msg.reaction == 'disagree'" />
      <q-icon :name="'heart'" v-else />
    </div>
  </base-chat-message>
</template>

<script lang="ts" setup>
import BaseChatMessage from './BaseChatMessage.vue';
import { Convo } from 'src/entities';
defineProps<{
  msg: Convo;
  currUser: string;
}>();
defineEmits(['replyTo']);
</script>

<style></style>
