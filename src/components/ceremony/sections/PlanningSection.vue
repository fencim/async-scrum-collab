<template>
  <q-card-section class="row">
    Confidence: {{ planning.confidence }}
  </q-card-section>
</template>
<script lang="ts" setup>
import { ICeremony, IPlanningCeremony } from 'src/entities';
import { computed } from 'vue';

const props = defineProps<{
  ceremony: ICeremony;
}>();
const planning = computed(() => {
  return props.ceremony as IPlanningCeremony;
});
</script>
