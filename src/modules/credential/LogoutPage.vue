<template>
  <q-page class="justify-evenly q-pa-sm">
    <q-dialog
      v-model="confirm"
      @hide="signOut ? $router.replace('/') : logout()"
    >
      <q-card>
        <q-card-section horizontal>
          <q-card-section>
            <q-icon name="logout" size="lg" />
          </q-card-section>
          <q-card-section> Are you sure? You want to logout? </q-card-section>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn @click="signOut = true" v-close-popup color="primary"
            >Yes</q-btn
          >
          <q-btn v-close-popup>Cancel</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { useProfilesStore } from 'src/stores/profiles.store';
import { defineComponent } from 'vue';
const profileStore = useProfilesStore();

export default defineComponent({
  name: 'LogoutPage',
  data() {
    return { confirm: true, signOut: false };
  },
  methods: {
    async logout() {
      await profileStore.signout();
      this.$router.replace({
        name: 'login',
      });
    },
  },
});
</script>
<style></style>
