<template>
  <q-page class="justify-evenly q-pa-sm">
    <q-form @submit="signIn">
      <q-card class="q-pa-sm">
        <q-card-section>
          <div class="text-h6">Login</div>
        </q-card-section>
        <q-input v-model="email" label="e-mail" :rules="['email']">
          <template v-slot:prepend><q-icon name="email" /></template>
        </q-input>
        <q-input
          v-model="password"
          label="password"
          type="password"
          :rules="[(v) => (v && v.length) || 'Enter password']"
        >
          <template v-slot:prepend><q-icon name="password" /></template>
        </q-input>
        <q-card-actions>
          <q-btn type="submit" icon="login" label="Login" />
          <q-btn icon="how_to_reg" :to="{ name: 'register' }" label="Signup" />
        </q-card-actions>
      </q-card>
    </q-form>
  </q-page>
</template>

<script lang="ts">
import { useProfilesStore } from 'src/stores/profiles.store';
import { defineComponent } from 'vue';
const profileStore = useProfilesStore();

export default defineComponent({
  name: 'LoginPage',
  components: {},
  data() {
    return {
      email: '',
      password: '',
    };
  },
  methods: {
    async signIn() {
      try {
        await profileStore.signIn(this.email, this.password);
        this.$q.notify({
          message: 'Successfully signed',
        });
        this.$router.replace('/');
      } catch (e) {
        this.$q.notify({
          message: String((e as { code: string }).code || e),
          position: 'top',
          color: 'negative',
        });
      }
    },
  },
});
</script>
<style></style>
