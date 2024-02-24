<script lang="ts" setup>
import { DiscussionItem } from 'src/entities';
import { PropType, ref } from 'vue';
import { formatKey } from './discussion.helper';
import RecentActiveMembers from './RecentActiveMembers.vue';
import { useActiveStore } from 'src/stores/active.store';
import { date } from 'quasar';
import { TheDialogs } from 'src/dialogs/the-dialogs';
import { TheWorkflows } from 'src/workflows/the-workflows';
const activeStore = useActiveStore();
defineProps({
  mini: Boolean,
  maxed: Boolean,
  noAction: Boolean,
  headerOnly: Boolean,
  chipOnly: Boolean,
  task: {
    required: true,
    type: Object as PropType<DiscussionItem>,
  },
});
const showDetails = ref(false);
</script>
<template>
  <div class="row">
    <q-btn
      class="text-bold"
      flat
      dense
      @click="TheDialogs.emit({ type: 'viewTask', arg: task })"
    >
      {{ formatKey(task.key || 'KEY') }}
    </q-btn>
    <div v-if="headerOnly" class="self-center">
      <slot name="title" />
    </div>
    <q-space />
    <q-badge
      floating
      rounded
      v-if="headerOnly && !chipOnly && typeof task.iteration == 'object'"
      dense
      >{{ task.iteration.name || task.iteration }}</q-badge
    >
    <q-badge
      class="q-mr-xs self-center"
      v-if="task.doneDate && !chipOnly"
      dense
      :color="
          (date.getDateDiff(task.dueDate!, task.doneDate, 'days') >= 0)
            ? 'primary'
            : 'negative'
        "
      >{{ date.formatDate(task.doneDate, 'MMM DD') }}</q-badge
    >
    <recent-active-members
      v-if="typeof task.assignedTo == 'object'"
      :profiles="[task.assignedTo]"
      sizes="sm"
    />
    <q-btn-dropdown
      v-else
      dense
      rounded
      content-class="bg-transparent no-shadow"
      no-icon-animation
      dropdown-icon="person"
      size="sm"
    >
      <RecentActiveMembers
        sizes="xs"
        v-close-popup
        :profiles="activeStore.activeMembers"
        @click-profile="
          (p) =>
            TheWorkflows.emit({
              type: 'assignTask',
              arg: {
                issue: task,
                profile: p,
              },
            })
        "
      />
    </q-btn-dropdown>
  </div>
  <q-card-section v-if="!headerOnly" class="q-px-sm no-shadow">
    <div class="row full-width">
      <div class="col self-center">
        <slot name="title" />
      </div>
      <div class="col-4 row justify-end" v-if="!!$slots['side']">
        <slot name="side" />
      </div>
    </div>
  </q-card-section>
  <div v-if="!headerOnly">
    <div
      class="row q-px-sm full-width justify-end q-py-xs"
      v-if="!!$slots['details'] && (showDetails || maxed || !mini)"
    >
      <slot name="details" />
    </div>
    <div
      class="row q-px-sm full-width justify-end q-py-xs"
      v-if="!!$slots['footer']"
    >
      <slot name="footer" />
    </div>
  </div>
  <div class="row full-width" v-if="!!$slots['bottom']">
    <slot name="bottom" />
  </div>
  <q-btn
    v-if="!$slots['dropdown'] && !noAction && !headerOnly"
    class="float-right vertical-middle"
    @click="showDetails = !showDetails"
    size="xs"
    icon="circle"
    dense
    flat
  />
  <q-btn-dropdown
    v-else-if="!noAction"
    unelevated
    padding="0"
    dropdown-icon="arrow_drop_down_circle"
    :outline="false"
    class="float-right vertical-middle"
    size="xs"
    dense
    flat
  >
    <slot name="dropdown" />
  </q-btn-dropdown>
</template>
