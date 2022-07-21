<template>
  <q-btn round>
    <q-avatar>
      <img
        v-if="profile.presentUser && profile.presentUser"
        :src="profile.presentUser.avatar"
      />
      <span>CU</span>
    </q-avatar>
    <q-menu>
      <div class="row no-wrap q-pa-md">
        <div class="column">
          <div class="text-h6 q-mb-md">Settings</div>
        </div>

        <q-separator vertical inset class="q-mx-lg" />

        <div class="column items-center">
          <q-avatar size="72px">
            <img
              v-if="profile.presentUser && profile.presentUser"
              :src="profile.presentUser.avatar"
            />
            <span>CU</span>
          </q-avatar>

          <div class="text-subtitle1 q-mt-md q-mb-xs">
            {{ profile.presentUser?.name }}
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
import { useProfilesStore } from 'src/stores/profiles.store';
import { defineComponent } from 'vue';
const profileStore = useProfilesStore();
export default defineComponent({
  name: 'ThePresentUser',
  components: {},
  data() {
    return {
      profile: profileStore,
    };
  },
  methods: {},
});
</script>
<style></style>
