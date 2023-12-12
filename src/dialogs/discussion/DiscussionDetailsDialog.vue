<script setup lang="ts">
import { ref } from 'vue';
import { DiscussionItem } from 'src/entities';

import CardDetails from 'src/components/CardDetails.vue';
import { TheDialogs } from '../the-dialogs';

const selectedItem = ref<undefined | DiscussionItem>();
const showItemBottomSheet = ref(false);

TheDialogs.on({
  type: 'viewTask',
  cb(e) {
    selectedItem.value = e;
    showItemBottomSheet.value = true;
  },
});
</script>
<template>
  <q-dialog v-model="showItemBottomSheet" :position="'bottom'">
    <card-details v-if="selectedItem" :item="selectedItem" />
  </q-dialog>
</template>
