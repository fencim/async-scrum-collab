<template>
  <q-btn round>
    <q-avatar>
      <img
        v-if="profileStore.theUser && profileStore.theUser.avatar"
        :src="profileStore.theUser.avatar"
      />
      <span>{{ initials(profileStore.theUser?.name) }}</span>
    </q-avatar>
    <q-badge v-if="notificationCount" floating>
      <q-icon name="notifications_active" /> {{ notificationCount }}
    </q-badge>
    <q-menu>
      <div class="row no-wrap q-pa-md">
        <div class="column">
          <div class="text-h6 q-mb-md">Guide</div>
          <q-btn
            round
            size="lg"
            icon="help"
            @click="
              TheDialogs.emit({
                type: 'scrumGuide',
                arg: {
                  keyword: '',
                },
              })
            "
          />
        </div>

        <q-separator vertical inset class="q-mx-lg" />

        <div class="column items-center">
          <q-avatar size="72px">
            <img
              v-if="profileStore.theUser && profileStore.theUser.avatar"
              :src="profileStore.theUser.avatar"
            />
            <span v-else>{{ initials(profileStore.theUser?.name) }}</span>
          </q-avatar>

          <div class="text-subtitle1 q-mt-md q-mb-xs">
            {{ profileStore.theUser?.name }}
          </div>

          <q-btn
            color="primary"
            label="Logout"
            :to="{ name: 'logout' }"
            push
            size="sm"
            v-close-popup
          />
        </div>
      </div>
      <q-separator />
      <q-list v-if="notificationCount">
        <q-item v-for="n in notificationStore.notifications" :key="n.tag">
          <q-item-section avatar>
            <q-avatar>
              <q-img :src="n.badge" v-if="n.badge" />
              <q-icon name="person" v-else />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ n.body }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script lang="ts" setup>
import { TheDialogs } from 'src/dialogs/the-dialogs';
import { useNotificationStore } from 'src/stores/notification.store';
import { useProfilesStore } from 'src/stores/profiles.store';
import { computed, onMounted } from 'vue';
const profileStore = useProfilesStore();
const notificationStore = useNotificationStore();
function initials(name?: string) {
  const m = (name || 'C U').match(/\b\w/g);
  return `${m && m[0]}${m && m[1]}`;
}
const notificationCount = computed(() => {
  return notificationStore.notifications.length;
});
onMounted(() => {
  return notificationStore.load();
});
</script>
<style></style>
