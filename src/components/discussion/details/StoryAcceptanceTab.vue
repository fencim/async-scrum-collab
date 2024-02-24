<template>
  <q-table
    dense
    class="col-12"
    :rows="task.acceptanceCriteria"
    :columns="acceptanceCriteriaColumns"
  >
  </q-table>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { DiscussionItem, IStory } from 'src/entities';

const props = defineProps<{
  item: DiscussionItem;
}>();
const task = ref(props.item as IStory);

const acceptanceCriteriaColumns = [
  {
    name: 'given',
    label: 'Given',
    field: 'given',
  },
  {
    name: 'when',
    label: 'When',
    field: 'when',
  },
  {
    name: 'then',
    label: 'Then',
    field: 'then',
  },
];
</script>
