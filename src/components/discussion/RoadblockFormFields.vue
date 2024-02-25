<script lang="ts" setup>
import { DiscussionItem, IRoadBlock } from 'src/entities';
import { onUpdated, ref } from 'vue';

const props = defineProps<{
  value: DiscussionItem;
}>();
const theDiscussion = ref(props.value as IRoadBlock);
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
    :rules="[(val:string) => val.length > 1 || 'Describe your roadblock' ]"
    label="Description"
  />
  <q-input
    v-model="theDiscussion.label"
    label="#label"
    class="col-12 text-lowercase"
    :rules="[(val:string) => val.length > 1 || 'Categorize roadblock by labeling' ]"
    ><template #prepend>#</template>
  </q-input>
</template>
