<template>
  <q-card-section class="row">
    {{ task.description }}
  </q-card-section>
</template>
<script lang="ts" setup>
import { DiscussionItem, TechnicalTask } from 'src/entities';
import { ref } from 'vue';

const props = defineProps<{
  item: DiscussionItem;
}>();
const task = ref(props.item as TechnicalTask);
</script>
