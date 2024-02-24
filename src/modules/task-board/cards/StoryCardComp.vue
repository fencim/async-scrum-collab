<script lang="ts" setup>
import BaseCard from 'src/components/BaseCardComponent.vue';
import { DiscussionItem, ISprintBoardColumn, IStory } from 'src/entities';
import { PropType } from 'vue';
import CommonCardAction from './CommonCardActionComp.vue';
import { convoBus } from 'src/modules/ceremony/convo-bus';
import CommonCardFooterComp from './CommonCardFooterComp.vue';
import { TheDialogs } from 'src/dialogs/the-dialogs';
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
    type: Object as PropType<IStory>,
  },
  mini: Boolean,
  maxed: Boolean,
  noAction: Boolean,
  headerOnly: Boolean,
  chipOnly: Boolean,
});
</script>
<template>
  <base-card
    :header-only="headerOnly"
    :maxed="maxed"
    :mini="mini"
    :no-action="noAction"
    :chip-only="chipOnly"
    :task="task"
  >
    <template #title>
      <div v-if="!mini">
        <div>
          As
          <span class="text-accent">{{ props.task.targetUser }}</span>
        </div>
        <div>
          I want to <span class="text-secondary">{{ props.task.subject }}</span>
        </div>
        <div>
          So that <span class="text-primary">{{ props.task.purpose }}</span>
        </div>
      </div>
      <div v-else class="text-capital">{{ task.subject }}</div>
    </template>
    <template #side v-if="mini && typeof task.iteration == 'object'">
      <div>
        <q-badge v-if="mini && typeof task.iteration == 'object'" dense>{{
          task.iteration.name || task.iteration
        }}</q-badge>
        <q-space />
        <q-badge v-if="task.complexity" class="text-h6 on-right">{{
          task.complexity
        }}</q-badge>
        <q-btn
          v-else
          dense
          flat
          icon="poll"
          @click="
            TheDialogs.emit({
              type: 'voteForItemComplexity',
              arg: { item: task },
            })
          "
        >
          <q-tooltip>Vote for Complexity</q-tooltip>
        </q-btn>
      </div>
    </template>
    <template #details>
      <q-list
        ><q-item
          v-for="(item, index) in props.task.acceptanceCriteria"
          :key="index"
        >
          <q-item-section>
            <q-item-label> Given {{ item.given }} </q-item-label>
            <q-item-label caption> When {{ item.when }} </q-item-label>
            <q-item-label> Then {{ item.then }} </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </template>
    <template #footer>
      <common-card-footer-comp :task="task" :maxed="maxed" :mini="mini" />
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
        <q-btn
          v-close-popup
          round
          icon="add_task"
          size="sm"
          @click="convoBus.emit('newSubTask', task)"
          ><q-tooltip>New Sub Task</q-tooltip></q-btn
        >
      </div>
    </template>
  </base-card>
</template>
<style lang="css" scoped>
.text-capital::first-letter {
  text-transform: capitalize;
}
</style>
