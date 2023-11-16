<script lang="ts" setup>
import draggable from 'vuedraggable';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { getComponent } from './card-components';
import { ref } from 'vue';
const discussionStore = useDiscussionStore();
const keywords = ref(null);
function onGrabTask(e: any) {
  console.log(Object.keys(e), e);
}
function getBacklog() {
  return discussionStore.productBacklog.tasks || [];
}
</script>
<template>
  <draggable
    class="col kanban-task-list dragArea list-group"
    :list="getBacklog()"
    @change="onGrabTask"
    group="tasks"
    item-key="key"
  >
    <template #header>
      <q-select
        class="q-px-sm"
        dense
        filled
        v-model="keywords"
        use-input
        use-chips
        dropdown-icon="none"
        multiple
        input-debounce="0"
      />
    </template>
    <template #item="{ element }">
      <q-card
        class="list-group-item q-ma-sm q-pa-sm board-card"
        :class="element.type + '-card'"
      >
        <component :is="getComponent(element)" :task="element" />
      </q-card>
    </template>
  </draggable>
</template>
