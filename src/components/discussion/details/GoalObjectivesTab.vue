<template>
  <q-list>
    <q-item v-for="item in objectives" :key="item.key">
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
import { DiscussionItem, IObjective, IGoal } from 'src/entities';
import { entityKey } from 'src/entities/base.entity';
import { getComponent } from 'src/modules/task-board/card-components';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { computed, ref } from 'vue';

const props = defineProps<{
  item: DiscussionItem;
}>();
const task = ref(props.item as IGoal);
const objectives = computed(() => {
  const discussionStore = useDiscussionStore();
  const goal = task.value;
  if (goal.type == 'goal') {
    return discussionStore.discussions.filter(
      (d) =>
        d.type == 'objective' && d.parent && entityKey(d.parent) == goal.key
    ) as IObjective[];
  }
  return [];
});
</script>
