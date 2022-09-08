<template>
  <q-chat-message
    :sent="
      (typeof msg.from == 'string' && msg.from == currUser) ||
      (typeof msg.from == 'object' && msg.from.key == currUser)
    "
  >
    <template v-slot:name>{{
      (typeof msg.from == 'string' && msg.from) ||
      (typeof msg.from == 'object' && msg.from.name)
    }}</template>

    <template v-slot:avatar>
      <q-avatar v-if="typeof msg.from == 'object'">
        <q-img :src="msg.from.avatar" fit="cover" />
      </q-avatar>
    </template>

    <template v-slot:stamp>
      <div>
        <q-btn
          @click="onReply(msg)"
          dense
          color="primary"
          flat
          round
          size="sm"
          icon="reply"
        />
        {{ stampTime(msg.date) }}
        <q-icon
          :name="getStatus(msg)"
          class="absolute-bottom-right rounded-borders"
          size="sm"
        />
      </div>
    </template>
    <div style="min-width: 120px">
      {{ msg.message }}
    </div>
  </q-chat-message>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { date } from 'quasar';
import { Convo } from 'src/entities';

export default defineComponent({
  name: 'ChatMessage',
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
    }, //stampTime
    getStatus(m: Convo) {
      switch (m.status) {
        case 'sent':
          return 'check_circle';
        default:
          return 'pending';
      }
    }, //getStatus
  }, //methods
});
</script>

<style></style>
