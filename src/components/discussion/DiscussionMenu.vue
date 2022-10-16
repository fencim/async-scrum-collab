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
    track-color="transparent"
  >
    {{ item.projectKey }}{{ (item.key.match(/\d+$/) || [])[0] }}
    <q-badge color="red" v-if="item.unread" floating>{{ item.unread }}</q-badge>
    <q-badge
      color="primary"
      v-else-if="item.progress"
      floating
      style="font-size: 7pt"
      >{{ (Number(item.progress) * 100).toFixed(0) }}%</q-badge
    >
    <q-tooltip
      ><div class="text-caption">
        {{ description }}
      </div>
      <q-linear-progress :value="item.progress" />
    </q-tooltip>
  </q-circular-progress>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { DiscussionItem, IProfile } from 'src/entities';

export default defineComponent({
  name: 'DiscussionMenu',
  emits: [],
  props: {
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
  },
  methods: {
    initials(name?: string) {
      const m = (name || 'C U').match(/\b\w/g);
      return `${m && m[0]}${m && m[1]}`;
    }, //initials
  }, //methods
});
</script>

<style></style>
