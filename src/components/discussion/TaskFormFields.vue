<script lang="ts" setup>
import { DiscussionItem, TechnicalTask } from 'src/entities';
import { onUpdated, ref } from 'vue';

const props = defineProps<{
  value: DiscussionItem;
}>();
const theDiscussion = ref<TechnicalTask>(props.value as TechnicalTask);
const $emits = defineEmits(['input']);
onUpdated(() => {
  $emits('input', theDiscussion.value);
});
</script>
<template>
  <q-input
    class="col-12"
    v-model="theDiscussion.description"
    type="textarea"
    label="Description"
  />
</template>
