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
            :toolbar="[]"
            :definitions="{}"
            dense
            flat
            class="input-box"
            placeholder="Message"
          >
            <template v-slot:label>
              <q-avatar size="sm" v-if="typeof replyTo?.from == 'object'">
                <img :src="replyTo?.from.avatar" />
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
              <span v-else>Why disagree?</span>
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
  emits: ['sendMessage', 'update:message', 'update:askingQuestion'],
  methods: {
    sendMessage() {
      this.$emit('sendMessage');
    },
    onType(e: string | number | null) {
      if (typeof e == 'string' && e && /\?$/.test(e)) {
        this.$emit('update:askingQuestion', true);
      } else {
        this.$emit('update:askingQuestion', false);
      }
      this.$emit('update:message', e);
    },
  },
});
</script>

<style scoped>
.input-box {
  height: 40px;
  font-size: 16px;
}
</style>
