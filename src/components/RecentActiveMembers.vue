<template>
  <div>
    <q-btn
      round
      :size="sizes"
      v-for="p in recent"
      :key="p.name"
      :href="p.href"
      @dblclick="$emit('ctrlClick', p)"
      @click.ctrl="$emit('ctrlClick', p)"
      @click="$emit('clickProfile', p)"
    >
      <q-avatar :size="sizes || '32px'">
        <img v-if="p && p.avatar" :src="p.avatar" />
        <span v-else>{{ initials(p?.name) }}</span>
      </q-avatar>
      <q-tooltip>{{ p?.name }}</q-tooltip>
    </q-btn>
    <q-btn
      class="extra"
      v-if="extraProfiles > 0"
      round
      @click="$emit('clickProfile', 'extra', profiles)"
      style="margin-left: -35px"
    >
      <q-avatar size="32px">
        <span class="absolute-center">+{{ extraProfiles }}</span>
        <img v-if="extra.avatar" :src="extra.avatar" />
      </q-avatar>
      <q-tooltip>Extra {{ extraProfiles }} Profiles</q-tooltip>
    </q-btn>
  </div>
</template>

<script lang="ts">
import { IProfile } from 'src/entities';
import { defineComponent, PropType } from 'vue';
const MAX_PROFILE_COUNT = 5;
export default defineComponent({
  name: 'RecentActiveMembers',
  emits: ['clickProfile', 'ctrlClick'],
  props: {
    profiles: {
      type: Object as PropType<IProfile[]>,
      required: true,
    },
    sizes: {
      type: String,
      required: false,
    },
  },
  computed: {
    recent() {
      return (
        (Array.isArray(this.profiles) &&
          this.profiles.filter((p) => p).slice(0, MAX_PROFILE_COUNT)) ||
        []
      );
    },
    extraProfiles() {
      return Math.max(
        0,
        ((Array.isArray(this.profiles) &&
          this.profiles.filter((p) => p).length) ||
          0) - MAX_PROFILE_COUNT
      );
    },
    extra() {
      return (
        (Array.isArray(this.profiles) && this.profiles[MAX_PROFILE_COUNT]) ||
        this.profiles[0]
      );
    },
  },
  methods: {
    initials(name?: string) {
      const m = (name || 'C U').match(/\b\w/g);
      return `${m && m[0]}${m && m[1]}`;
    },
  },
});
</script>
