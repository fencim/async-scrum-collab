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
            :loading="action == LoginAction.userAndPassword"
            :disable="action != 0"
            type="submit"
            icon="login"
            label="Login"
          />
          <div class="text-center">Or</div>
          <q-btn
            :loading="action == LoginAction.goolgle"
            :disable="action != LoginAction.none"
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
            :loading="action == LoginAction.signUp"
            :disable="action != LoginAction.none"
            icon="how_to_reg"
            :to="{ name: 'register' }"
            label="Signup"
          />
        </q-card-actions>
      </q-card>
    </q-form>
  </q-page>
</template>

<script lang="ts" setup>
import { FirebaseError } from 'firebase/app';
import { useQuasar } from 'quasar';
import { useProfilesStore } from 'src/stores/profiles.store';
import { TheWorkflows } from 'src/workflows/the-workflows';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

enum LoginAction {
  none,
  userAndPassword,
  goolgle,
  signUp,
}
const email = ref('');
const password = ref('');
const action = ref(LoginAction.none);

async function signIn() {
  const profileStore = useProfilesStore();
  const $q = useQuasar();
  const $router = useRouter();
  try {
    action.value = LoginAction.userAndPassword;
    await profileStore.signIn(email.value, password.value);
    $q.notify({
      message: 'Successfully signed',
    });
    $router.replace('/');
  } catch (e) {
    $q.notify({
      message: String((e as { code: string }).code || e),
      position: 'top',
      color: 'negative',
    });
  }
}
const $q = useQuasar();
const $router = useRouter();
async function withGoogle() {
  action.value = LoginAction.goolgle;
  TheWorkflows.emit({
    type: 'loginWithGoogle',
    arg: {
      done() {
        $q.notify({
          message: 'Successfully signed',
          caption: 'Loading...',
          progress: true,
          onDismiss: () => {
            $router.replace('/');
          },
        });
      },
      error(e) {
        action.value = LoginAction.none;
        if (e instanceof FirebaseError) {
          $q.notify({
            message: String(e.code),
            position: 'top',
            color: 'negative',
          });
        }
      },
    },
  });
}
</script>
<style></style>
