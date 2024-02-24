<template>
  <q-card-section class="row">
    <div class="col-12">
      <strong>Description:</strong> {{ task.description }}
    </div>
    <div class="col-6"><strong>Specifics:</strong> {{ task.specifics }}</div>
    <div class="col-6"><strong>Measures:</strong> {{ task.measures }}</div>
    <div class="col-6"><strong>Enables:</strong> {{ task.enables }}</div>
    <div class="col-6">
      <strong>Due:</strong>
      {{ date.formatDate(task.dueDate, 'MMM D, YYYY') }}
    </div>
  </q-card-section>
</template>
<script lang="ts" setup>
import { date } from 'quasar';
import { DiscussionItem, IObjective } from 'src/entities';
import { ref } from 'vue';

const props = defineProps<{
  item: DiscussionItem;
}>();
const task = ref(props.item as IObjective);
</script>
