<template>
  <q-page class="column q-pa-sm">
    <q-form @submit="signIn">
      <q-card class="q-pa-sm" :class="$q.screen.gt.sm ? 'q-ma-xl' : 'q-my-xl'">
        <q-card-section>
          <div class="text-h6">Login</div>
        </q-card-section>
        <q-input
          :disable="action != 0"
          v-model="email"
          label="e-mail"
          :rules="['email']"
        >
          <template v-slot:prepend><q-icon name="email" /></template>
        </q-input>
        <q-input
          v-model="password"
          :disable="action != 0"
          label="password"
          type="password"
          :rules="[(v) => (v && v.length) || 'Enter password']"
        >
          <template v-slot:prepend><q-icon name="password" /></template>
        </q-input>
        <q-card-actions vertical>
          <q-btn
            :loading="action == 1"
            :disable="action != 0"
            type="submit"
            icon="login"
            label="Login"
          />
          <div class="text-center">Or</div>
          <q-btn
            :loading="action == 2"
            :disable="action != 0"
            @click="withGoogle"
            label="Login with Gooogle"
            padding="10px"
          >
            <q-img
              src="~/assets/googleg_standard_color_128dp.png"
              height="20px"
              fit="contain"
            />
          </q-btn>
          <div class="text-center">Or</div>
          <q-btn
            :loading="action == 3"
            :disable="action != 0"
            icon="how_to_reg"
            :to="{ name: 'register' }"
            label="Signup"
          />
        </q-card-actions>
      </q-card>
    </q-form>
  </q-page>
</template>

<script lang="ts">
import { useProfilesStore } from 'src/stores/profiles.store';
import { defineComponent } from 'vue';
const profileStore = useProfilesStore();
enum LoginAction {
  none,
  userAndPassword,
  goolgle,
  signUp,
}
export default defineComponent({
  name: 'LoginPage',
  components: {},
  data() {
    return {
      email: '',
      password: '',
      action: LoginAction.none,
    };
  },
  methods: {
    async signIn() {
      try {
        this.action = LoginAction.userAndPassword;
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
    async withGoogle() {
      try {
        this.action = LoginAction.goolgle;
        await profileStore.signInWithGoogle();
        this.$q.notify({
          message: 'Successfully signed',
        });
        this.$router.replace('/');
      } catch (e) {
        this.action = LoginAction.none;
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
