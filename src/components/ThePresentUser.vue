<template>
  <q-btn round>
    <q-avatar>
      <img
        v-if="profile.theUser && profile.theUser.avatar"
        :src="profile.theUser.avatar"
      />
      <span>{{ initials(profile.theUser?.name) }}</span>
    </q-avatar>
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
              v-if="profile.theUser && profile.theUser.avatar"
              :src="profile.theUser.avatar"
            />
            <span v-else>{{ initials(profile.theUser?.name) }}</span>
          </q-avatar>

          <div class="text-subtitle1 q-mt-md q-mb-xs">
            {{ profile.theUser?.name }}
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
    </q-menu>
  </q-btn>
</template>

<script lang="ts">
import { TheDialogs } from 'src/dialogs/the-dialogs';
import { useProfilesStore } from 'src/stores/profiles.store';
import { defineComponent } from 'vue';
const profileStore = useProfilesStore();
export default defineComponent({
  name: 'ThePresentUser',
  components: {},
  data() {
    return {
      TheDialogs,
      profile: profileStore,
    };
  },
  methods: {
    initials(name?: string) {
      const m = (name || 'C U').match(/\b\w/g);
      return `${m && m[0]}${m && m[1]}`;
    },
  },
});
</script>
<style></style>
