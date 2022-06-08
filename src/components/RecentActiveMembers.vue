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
        <img :src="p.avatar" />
      </q-avatar>
      <q-tooltip>{{ p.name }}</q-tooltip>
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
        <img :src="extra.avatar" />
      </q-avatar>
      <q-tooltip>Extra {{ extraProfiles }} Profiles</q-tooltip>
    </q-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
const MAX_PROFILE_COUNT = 5;
export default defineComponent({
  name: 'RecentActiveMembers',
  emits: ['clickProfile', 'ctrlClick'],
  props: {
    profiles: {
      type: Object,
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
        Array.isArray(this.profiles) &&
        this.profiles.slice(0, MAX_PROFILE_COUNT)
      );
    },
    extraProfiles() {
      return Math.max(
        0,
        ((Array.isArray(this.profiles) && this.profiles.length) || 0) -
          MAX_PROFILE_COUNT
      );
    },
    extra() {
      return (
        (Array.isArray(this.profiles) && this.profiles[MAX_PROFILE_COUNT]) ||
        this.profiles[0]
      );
    },
  },
});
</script>
