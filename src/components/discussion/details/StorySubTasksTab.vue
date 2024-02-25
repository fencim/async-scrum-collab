<template>
  <q-list>
    <q-item v-for="item in subTasks" :key="item.key">
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
import { TechnicalTask, IStory, DiscussionItem } from 'src/entities';
import { entityKey } from 'src/entities/base.entity';
import { getComponent } from 'src/modules/task-board/card-components';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { computed, ref } from 'vue';

const props = defineProps<{
  item: DiscussionItem;
}>();
const task = ref(props.item as IStory);
const subTasks = computed(() => {
  const discussionStore = useDiscussionStore();
  const story = task.value;
  if (story.type == 'story') {
    return discussionStore.discussions.filter(
      (d) => d.type == 'task' && d.parent && entityKey(d.parent) == story.key
    ) as TechnicalTask[];
  }
  return [];
});
</script>
