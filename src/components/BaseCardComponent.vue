<script lang="ts" setup>
import { DiscussionItem } from 'src/entities';
import { PropType, ref } from 'vue';
import { formatKey } from './discussion.helper';
import { convoBus } from 'src/modules/ceremony/convo-bus';
import RecentActiveMembers from './RecentActiveMembers.vue';
import { useActiveStore } from 'src/stores/active.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
const activeStore = useActiveStore();
const discussionStore = useDiscussionStore();
defineProps({
  mini: Boolean,
  maxed: Boolean,
  noAction: Boolean,
  task: {
    required: true,
    type: Object as PropType<DiscussionItem>,
  },
});
const showDetails = ref(false);
</script>
<template>
  <div class="row">
    <q-btn flat dense @click="convoBus.emit('viewTask', task)">
      {{ formatKey(task.key || 'KEY') }}
    </q-btn>
    <q-space />
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
        @click-profile="(p) => discussionStore.assignTaskTo(task, p)"
      />
    </q-btn-dropdown>
  </div>
  <q-card-section class="q-px-sm no-shadow">
    <div class="row full-width">
      <div class="col self-center">
        <slot name="title" />
      </div>
      <div class="col-4 row justify-end" v-if="!!$slots['side']">
        <slot name="side" />
      </div>
    </div>
  </q-card-section>
  <div>
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
    <div class="row full-width" v-if="!!$slots['bottom']">
      <slot name="bottom" />
    </div>
  </div>
  <q-btn
    v-if="!$slots['dropdown'] && !noAction"
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
