<template>
  <q-avatar :size="'32px'" v-if="item.type == 'scrum'">
    <img
      v-if="reporter && reporter.avatar"
      :src="reporter.avatar"
      fit="cover"
    />
    <span v-else>{{ initials(reporter?.name) }}</span>
    <q-badge color="red" v-if="item.unread" floating>{{ item.unread }}</q-badge>
    <q-badge
      color="transparent"
      v-else-if="item.progress"
      floating
      style="font-size: 7pt"
      >{{ (Number(item.progress) * 100).toFixed(0) }}%</q-badge
    >
    <q-tooltip
      >{{ reporter?.name }}
      <div class="text-caption">
        {{ description }}
      </div>
      <q-linear-progress :value="item.progress" />
    </q-tooltip>
  </q-avatar>
  <q-circular-progress
    v-else
    :value="(item.progress || 0) * 100"
    show-value
    font-size="12px"
    class="text-white q-ma-sm text-uppercase"
    size="40px"
    :thickness="0.15"
    color="grey"
    track-color="black"
  >
    <q-icon
      v-if="item.type == 'went-well'"
      name="sentiment_very_satisfied"
      size="lg"
    />
    <q-icon
      v-else-if="item.type == 'went-wrong'"
      name="sentiment_very_dissatisfied"
      size="lg"
    />
    <q-icon
      v-else-if="item.type == 'to-improve'"
      name="self_improvement"
      size="lg"
    />
    <q-icon
      v-else-if="item.type == 'action-item'"
      name="rocket_launch"
      size="lg"
    />
    <span v-else>
      {{ formatKey(item.key) }}
    </span>
    <q-badge color="red" v-if="item.unread" floating>{{ item.unread }}</q-badge>
    <q-badge
      color="primary"
      v-else-if="item.progress"
      floating
      align="bottom"
      style="font-size: 7pt"
      >{{ (Number(item.progress) * 100).toFixed(0) }}%</q-badge
    >
    <q-tooltip
      class="q-pa-none q-ma-none"
      :anchor="'center right'"
      :self="'center left'"
      :offset="[10, 10]"
    >
      <q-card
        style="min-width: 250px"
        class="board-card no-shadow"
        :class="item.type + '-card'"
      >
        <component
          :is="getComponent(item as PlanningItem)"
          :task="item"
          :no-action="true"
        />
      </q-card>
    </q-tooltip>
  </q-circular-progress>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { DiscussionItem, IProfile, PlanningItem } from 'src/entities';
import { formatKey } from '../discussion.helper';
import { getComponent } from 'src/modules/task-board/card-components';

defineProps({
  item: {
    type: Object as PropType<DiscussionItem>,
    required: true,
  },
  reporter: {
    type: Object as PropType<IProfile>,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  currUser: {
    type: String,
  },
});
function initials(name?: string) {
  const m = (name || 'C U').match(/\b\w/g);
  return `${m && m[0]}${m && m[1]}`;
}
</script>

<style></style>
