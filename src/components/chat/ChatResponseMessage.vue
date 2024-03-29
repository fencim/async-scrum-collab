<template>
  <base-chat-message :msg="msg" :curr-user="currUser" @reply-to="onReply">
    <a
      style="min-width: 150px; text-decoration: none"
      class="text-grey-9 no"
      v-for="r in [refMsg]"
      :key="r?.key"
      :href="href + r?.key"
    >
      <q-avatar size="sm" v-if="typeof r?.from == 'object'">
        <img v-if="r?.from.avatar" :src="r?.from.avatar" />
        <span v-else>{{ initials(r?.from?.name) }}</span>
      </q-avatar>
      &nbsp;
      <span v-html="r?.message"></span>
      <q-icon name="question_mark" v-if="r?.type == 'question'" size="sm" />
      <q-icon name="reply" size="sm" />
    </a>
    <div style="min-width: 150px" v-if="msg.type == 'response'">
      <q-card class="bg-transparent text-dark no-shadow">
        <q-card-section horizontal>
          <q-card-actions
            vertical
            align="right"
            v-if="refMsg?.type == 'question'"
          >
            <q-btn
              icon="thumb_up_alt"
              size="sm"
              flat
              :color="
                (msg.feedback || {})[currUser || ''] == 'agree'
                  ? 'primary'
                  : 'dark'
              "
              dense
              @click="resolveQuestionOf(msg, 'agree')"
              ><q-tooltip>{{
                Object.values(msg.feedback || {}).filter((m) => m == 'agree')
                  .length
              }}</q-tooltip>
            </q-btn>
            <q-btn
              icon="thumb_down_alt"
              size="sm"
              flat
              :color="
                (msg.feedback || {})[currUser || ''] == 'disagree'
                  ? 'primary'
                  : 'dark'
              "
              dense
              @click="resolveQuestionOf(msg, 'disagree')"
            >
              <q-tooltip>{{
                Object.values(msg.feedback || {}).filter((m) => m == 'disagree')
                  .length
              }}</q-tooltip>
            </q-btn>
          </q-card-actions>
          <q-card-section>
            <span v-html="msg.message"></span>
          </q-card-section>
        </q-card-section>
      </q-card>
    </div>
  </base-chat-message>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import BaseChatMessage from './BaseChatMessage.vue';
import { Convo } from 'src/entities';

export default defineComponent({
  name: 'ChatResponseMessage',
  components: { BaseChatMessage },
  emits: ['replyTo', 'resolveQuestion'],
  props: {
    msg: {
      type: Object as PropType<Convo>,
      required: true,
    },
    refMsg: {
      type: Object as PropType<Convo>,
    },
    href: { type: String, required: true },
    currUser: {
      type: String,
    },
  },
  methods: {
    onReply(m: Convo) {
      this.$emit('replyTo', m);
    },
    resolveQuestionOf(msg: Convo, resolution: string) {
      this.$emit('resolveQuestion', msg, resolution);
    },
    initials(name?: string) {
      const m = (name || 'C U').match(/\b\w/g);
      return `${m && m[0]}${m && m[1]}`;
    }, //initials
  }, //methods
});
</script>

<style></style>
