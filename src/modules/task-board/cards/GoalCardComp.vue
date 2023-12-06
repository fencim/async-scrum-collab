<script lang="ts" setup>
import BaseCard from 'src/components/BaseCardComponent.vue';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import CommonCardAction from './CommonCardActionComp.vue';
import { DiscussionItem, IGoal, ISprintBoardColumn } from 'src/entities';
import { PropType, ref } from 'vue';
import { getProfiles } from './card-helpers';

defineEmits<{
  (
    e: 'taskMoved',
    issue: DiscussionItem,
    column?: ISprintBoardColumn,
    iterationKey?: string
  ): void;
}>();
const props = defineProps({
  task: {
    required: true,
    type: Object as PropType<IGoal>,
  },
  mini: Boolean,
  maxed: Boolean,
  noAction: Boolean,
});
const dueDate = ref(props.task.dueDate || '');
</script>
<template>
  <base-card :maxed="maxed" :mini="mini" :no-action="noAction" :task="task">
    <template #title>
      {{ task.description }}
    </template>
    <template #side>
      <div>
        <q-badge v-if="mini && typeof task.iteration == 'object'" dense>{{
          task.iteration.name || task.iteration
        }}</q-badge>
      </div>
    </template>
    <template #footer>
      <recent-active-members
        sizes="xs"
        :profiles="getProfiles(task.assignees)"
      />
      <q-space />
      <div>
        <q-badge class="q-mr-xs" dense color="primary">{{
          task.priority || 'P1'
        }}</q-badge>
        <q-chip dense :color="task.dueDate ? 'secondary' : 'negative'"
          >{{ task.dueDate || 'ND' }}
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="dueDate">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-chip>
      </div>
    </template>
    <template #bottom>
      <q-linear-progress :value="task.progress || 0" />
    </template>
    <template #dropdown>
      <div class="row bg-transaparent no-shadow">
        <common-card-action
          :task="task"
          @task-moved="
            (issue, col, iteration) => $emit('taskMoved', issue, col, iteration)
          "
        />
      </div>
    </template>
  </base-card>
</template>
