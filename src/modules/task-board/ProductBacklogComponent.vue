<script lang="ts" setup>
import draggable from 'vuedraggable';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { getComponent } from './card-components';
const discussionStore = useDiscussionStore();
</script>
<template>
  <draggable
    class="col kanban-task-list dragArea list-group"
    :list="discussionStore.productBacklog.tasks"
    group="tasks"
    item-key="key"
  >
    <template #item="{ element }">
      <q-card
        class="list-group-item q-ma-sm q-pa-sm board-card"
        :class="element.type + '-card'"
      >
        <component :is="getComponent(element)" mini :task="element" />
      </q-card>
    </template>
  </draggable>
</template>
