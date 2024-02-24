<template>
  <q-list>
    <q-item v-for="item in roadblocks" :key="item.key">
      <q-card
        class="list-group-item board-card no-shadow full-width"
        :class="item.type + '-card'"
      >
        <component
          :is="getComponent(item)"
          :task="item"
          header-only
          no-action
          mini
        />
      </q-card>
    </q-item>
  </q-list>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue';
import { DiscussionItem, IScrumReport } from 'src/entities';
import { getComponent } from 'src/modules/task-board/card-components';
import { useDiscussionStore } from 'src/stores/discussions.store';

const props = defineProps<{
  item: DiscussionItem;
}>();
const task = ref(props.item as IScrumReport);
const roadblocks = computed(() => {
  const discussionStore = useDiscussionStore();
  const scrum = task.value;
  if (scrum.type == 'scrum') {
    const listKeys = (scrum.roadblocks || []).filter(
      (t) => typeof t == 'string'
    ) as string[];
    const listTasks = (scrum.roadblocks || []).filter(
      (t) => typeof t == 'object'
    ) as DiscussionItem[];
    return [...listTasks, ...discussionStore.fromList(listKeys)];
  }
  return [];
});
</script>
