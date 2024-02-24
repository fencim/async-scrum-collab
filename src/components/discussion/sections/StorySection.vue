<template>
  <q-card-section class="row">
    {{ task.description }}
  </q-card-section>
  <q-card-section class="row">
    <div>
      As
      <span class="text-accent">{{ task.targetUser }}</span>
    </div>
    ,&nbsp;
    <div>
      I want to <span class="text-secondary">{{ task.subject }}</span>
    </div>
    ,&nbsp;
    <div>
      So that <span class="text-primary">{{ task.purpose }}</span>
    </div>
  </q-card-section>
</template>
<script lang="ts" setup>
import { DiscussionItem, IStory } from 'src/entities';
import { ref } from 'vue';

const props = defineProps<{
  item: DiscussionItem;
}>();
const task = ref(props.item as IStory);
</script>
