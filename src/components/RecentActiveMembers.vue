<template>
  <div>
    <q-btn
      round
      :size="sizes"
      v-for="p in recent"
      :key="p.name"
      @dblclick="$emit('ctrlClick', p)"
      @click.ctrl="$emit('ctrlClick', p)"
      @click="$emit('clickProfile', p)"
    >
      <q-avatar :size="sizes || '32px'">
        <img v-if="p && p.avatar" :src="p.avatar" />
        <span v-else-if="p?.key == profileStore.presentUser?.key">Me</span>
        <span v-else>{{ initials(p?.name) }}</span>
      </q-avatar>
      <slot name="profileTooltip" v-if="$slots.profileTooltip" :profile="p" />
      <q-tooltip v-else
        >{{ p?.name
        }}<span v-if="p?.key == profileStore.presentUser?.key"
          >(Me)</span
        ></q-tooltip
      >
    </q-btn>
    <q-btn
      class="extra"
      v-if="extraProfiles > 0"
      round
      @click.prevent.stop="$emit('clickProfile', 'extra', profiles)"
      style="margin-left: -35px"
    >
      <q-avatar :size="sizes || '32px'">
        <span class="absolute-center">+{{ extraProfiles }}</span>
        <img v-if="extra.avatar" :src="extra.avatar" />
      </q-avatar>
      <q-tooltip>Extra {{ extraProfiles }} Profiles</q-tooltip>
    </q-btn>
  </div>
</template>

<script lang="ts">
import { IProfile } from 'src/entities';
import { useProfilesStore } from 'src/stores/profiles.store';
import { defineComponent, PropType } from 'vue';
const MAX_PROFILE_COUNT = 5;
export default defineComponent({
  name: 'RecentActiveMembers',
  emits: ['clickProfile', 'ctrlClick'],
  data() {
    return {
      profileStore: useProfilesStore(),
    };
  },
  props: {
    profiles: {
      type: Object as PropType<IProfile[]>,
      required: true,
    },
    sizes: {
      type: String,
      required: false,
    },
    maxCount: Number,
  },
  computed: {
    recent() {
      return (
        (Array.isArray(this.profiles) &&
          this.profiles
            .filter((p) => p)
            .slice(0, this.maxCount || MAX_PROFILE_COUNT)) ||
        []
      );
    },
    extraProfiles() {
      return Math.max(
        0,
        ((Array.isArray(this.profiles) &&
          this.profiles.filter((p) => p).length) ||
          0) - (this.maxCount || MAX_PROFILE_COUNT)
      );
    },
    extra() {
      return (
        (Array.isArray(this.profiles) &&
          this.profiles[this.maxCount || MAX_PROFILE_COUNT]) ||
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
