<template>
  <q-form @submit="sendMessage">
    <q-page-sticky expand position="bottom">
      <q-toolbar class="bg-grey-10" style="padding-right: 70px">
        <q-btn icon="poll " flat round />
        <q-btn icon="attachment" flat round />
        <q-toolbar-title class="q-pa-sm">
          <q-editor
            style="text-align: right"
            :model-value="message"
            @update:model-value="onType"
            rounded
            @keydown.enter.prevent="sendMessage"
            :toolbar="[['header']]"
            :definitions="{}"
            dense
            flat
            :class="replyTo ? 'input-box-reply' : 'input-box'"
            placeholder="Message"
          >
            <template #header>
              <q-avatar
                color="info"
                size="sm"
                v-if="typeof replyTo?.from == 'object'"
              >
                <q-img
                  v-if="replyTo?.from.avatar"
                  :src="replyTo?.from.avatar"
                  fit="cover"
                />
                <span v-else class="text-uppercase">{{
                  initials(replyTo?.from.name)
                }}</span>
              </q-avatar>
              <q-avatar size="sm" v-else-if="confirmDisagreement">
                <q-icon name="thumb_down_alt" />
              </q-avatar>
              &nbsp;
              <span
                v-if="replyTo && !confirmDisagreement"
                class="text-weight-bold text-deep-orange"
                >{{ replyTo?.message
                }}<q-icon
                  name="question_mark"
                  v-if="replyTo?.type == 'question'"
              /></span>
              <q-btn
                icon="close"
                v-if="replyTo"
                dense
                round
                size="xs"
                @click="$emit('cancel:reply')"
              />
            </template>
          </q-editor>
        </q-toolbar-title>
        <q-btn type="submit" icon="send" flat round />
      </q-toolbar>
      <slot />
    </q-page-sticky>
  </q-form>
</template>

<script lang="ts">
import { Convo } from 'src/entities';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'ChatMessageForm',
  props: {
    message: {
      type: String,
      required: true,
    },
    replyTo: {
      type: Object as PropType<Convo>,
    },
    askingQuestion: {
      type: Boolean,
      default: false,
    },
    confirmDisagreement: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'sendMessage',
    'update:message',
    'update:askingQuestion',
    'cancel:reply',
  ],
  methods: {
    sendMessage() {
      this.$emit('sendMessage');
    },
    onType(e: string | number | null) {
      this.$emit(
        'update:askingQuestion',
        typeof e == 'string' && e && /.+\?/.test(e)
      );
      this.$emit('update:message', e);
    },
    initials(name?: string) {
      const m = (name || 'U N').match(/\b\w/g);
      return `${m && m[0]}${m && m[1]}`;
    },
  },
});
</script>

<style scoped>
.input-box-reply {
  height: 70px;
  font-size: 16px;
}
.input-box {
  height: 30px;
  font-size: 16px;
}
</style>
