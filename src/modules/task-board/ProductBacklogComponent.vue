<script lang="ts" setup>
import draggable from 'vuedraggable';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { getComponent } from './card-components';
import { computed, ref } from 'vue';
const discussionStore = useDiscussionStore();
const keywords = ref<null | FilterOption[]>(null);
type FilterOption = {
  type: 'Iteration' | 'Type';
  value: string;
  display: string;
};

const backlog = computed(() => {
  return (discussionStore.productBacklog.tasks || []).filter((task) => {
    if (!keywords.value || keywords.value.length == 0) return true;
    return keywords.value.find(
      (f) =>
        (f.type == 'Type' && task.type == f.value) ||
        (f.type == 'Iteration' &&
          ((typeof task.iteration == 'object' &&
            task.iteration.key == f.value) ||
            f.value == task.iteration))
    );
  });
});
const filterOptions = computed(() => {
  return backlog.value.reduce((p, c) => {
    const iteration = typeof c.iteration == 'object' ? c.iteration : undefined;
    if (
      typeof iteration == 'object' &&
      !p.find((o) => o.type == 'Iteration' && o.value == iteration.key)
    ) {
      p.push({
        type: 'Iteration',
        value: iteration.key,
        display: iteration.name,
      });
    }
    if (c.type && !p.find((o) => o.type == 'Type' && o.value == c.type)) {
      p.push({
        type: 'Type',
        value: c.type,
        display: c.type.replace(/^\w/, (m) => m.toUpperCase()),
      });
    }
    return p;
  }, [] as FilterOption[]);
});
</script>
<template>
  <draggable
    class="col kanban-task-list dragArea list-group"
    :list="backlog"
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
        hide-dropdown-icon
        multiple
        :options="filterOptions"
        input-debounce="0"
      >
        <template #selected-item="{ opt, removeAtIndex, index }">
          <q-chip
            v-if="keywords"
            dense
            removable
            text-color="primary"
            class="q-my-none q-ml-xs q-mr-none"
            @remove="removeAtIndex(index)"
          >
            {{ opt.type }} : {{ opt.display }}
          </q-chip>
          <q-badge v-else>*none*</q-badge>
        </template>
        <template #option="{ opt, itemProps }">
          <q-item v-bind="itemProps">
            <q-item-section>
              <q-item-label caption>{{ opt.type }}</q-item-label>
              <q-item-label>{{ opt.display }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </template>
    <template #item="{ element }">
      <q-card
        class="list-group-item q-ma-sm q-pa-sm board-card no-shadow"
        :class="element.type + '-card'"
      >
        <component
          :is="getComponent(element)"
          :task="element"
          :header-only="$q.screen.lt.md"
          mini
        />
      </q-card>
    </template>
  </draggable>
</template>
