<script setup lang="ts">
import { ref } from 'vue';
import { ICeremony } from 'src/entities';

import { TheDialogs } from '../the-dialogs';
import CeremonyDetails from 'src/components/CeremonyDetails.vue';

const ceremony = ref<ICeremony>();
const showItemBottomSheet = ref(false);

TheDialogs.on({
  type: 'viewCeremonyProgress',
  async cb(e) {
    if (showItemBottomSheet.value) {
      showItemBottomSheet.value = false;
      await new Promise((resolve) => setTimeout(resolve));
    }
    ceremony.value = e.ceremony;
    showItemBottomSheet.value = true;
  },
});
</script>
<template>
  <q-dialog v-model="showItemBottomSheet" :position="'bottom'">
    <ceremony-details v-if="ceremony" :ceremony="ceremony" />
  </q-dialog>
</template>
