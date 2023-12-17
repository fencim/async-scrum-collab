<script lang="ts" setup>
import MarkdownPreview from '@uivjs/vue-markdown-preview';
import { ref } from 'vue';
import whatIsScrum from 'src/guides/what-is-scrum.guide.md?raw';
import { TheDialogs } from '../the-dialogs';
const keyword = ref('');
const showGuideSheet = ref(false);
TheDialogs.on({
  type: 'scrumGuide',
  cb(e) {
    keyword.value = e.keyword || '';
    showGuideSheet.value = true;
  },
});
</script>
<template>
  <q-dialog v-model="showGuideSheet" :position="'right'">
    <MarkdownPreview :source="whatIsScrum" />
  </q-dialog>
</template>
