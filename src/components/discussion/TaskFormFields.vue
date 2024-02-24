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
  <q-btn-group spread class="col-12">
    <q-btn
      :color="theDiscussion.kind == 'technical' ? 'primary' : 'info'"
      icon="memory"
      @click="theDiscussion.kind = 'technical'"
      >Technical</q-btn
    >
    <q-btn
      :color="theDiscussion.kind == 'defect' ? 'primary' : 'info'"
      @click="theDiscussion.kind = 'defect'"
      icon="bug_report"
      >Defect</q-btn
    >
  </q-btn-group>
  <q-input
    class="col-12"
    v-model="theDiscussion.description"
    type="textarea"
    label="Description"
  />
</template>
