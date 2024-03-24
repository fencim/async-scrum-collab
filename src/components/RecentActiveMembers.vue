<template>
  <div>
    <q-btn
      round
      :color="color(p.key)"
      class="q-mr-xs"
      dense
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
        }}<span v-if="p?.key == profileStore.presentUser?.key">(Me)</span> [{{
          activeOn(p.key)
        }}]</q-tooltip
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

<script lang="ts" setup>
import { date } from 'quasar';
import { IProfile } from 'src/entities';
import { useOnlineUsersStore } from 'src/stores/online-users.store';
import { useProfilesStore } from 'src/stores/profiles.store';
import { computed } from 'vue';
const MAX_PROFILE_COUNT = 5;
const props = defineProps<{
  profiles: IProfile[];
  sizes?: string;
  maxCount?: number;
}>();
defineEmits(['clickProfile', 'ctrlClick']);
const profileStore = useProfilesStore();
const recent = computed(() => {
  return (
    (Array.isArray(props.profiles) &&
      props.profiles
        .filter((p) => p)
        .slice(0, props.maxCount || MAX_PROFILE_COUNT)) ||
    []
  );
});
const extraProfiles = computed(() => {
  return Math.max(
    0,
    ((Array.isArray(props.profiles) &&
      props.profiles.filter((p) => p).length) ||
      0) - (props.maxCount || MAX_PROFILE_COUNT)
  );
});
const extra = computed(() => {
  return (
    (Array.isArray(props.profiles) &&
      props.profiles[props.maxCount || MAX_PROFILE_COUNT]) ||
    props.profiles[0]
  );
});
const onlineUserStore = useOnlineUsersStore();
function activeUser(key: string) {
  return onlineUserStore.onlineUsers.find((u) => u.key == key);
}
function color(userId: string) {
  if (activeUser(userId)) {
    return 'amber';
  }
}
function activeOn(userKey: string) {
  const session = activeUser(userKey);
  if (session?.lastActivityTime) {
    const dateTime = date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss.SSS');
    const minutes = date.getDateDiff(
      dateTime,
      session.lastActivityTime,
      'minutes'
    );
    if (minutes > 60) {
      return `${Math.round(minutes / 60)} hr`;
    } else if (minutes > 0) {
      return `${minutes} min`;
    } else {
      return 'now';
    }
  }
  return 'offline';
}
function initials(name?: string) {
  const m = (name || 'C U').match(/\b\w/g);
  return `${m && m[0]}${m && m[1]}`;
}
</script>
