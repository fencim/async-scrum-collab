<template>
  <q-page class="justify-evenly q-pa-sm">
    <q-form @submit="register">
      <q-card class="q-pa-sm">
        <q-card-section>
          <q-banner>
            <template v-slot:avatar>
              <q-icon name="how_to_reg" color="primary" />
            </template>
            <div class="text-h6">Register new Account</div>
          </q-banner>
        </q-card-section>
        <q-input v-model="email" label="e-mail" :rules="['email']">
          <template v-slot:prepend><q-icon name="email" /></template>
        </q-input>
        <q-input
          label="Display Name"
          v-model="displayName"
          :rules="[(v) => (v && v.length) || 'Enter Name']"
          ><template v-slot:prepend><q-icon name="person" /></template
        ></q-input>
        <q-input
          v-model="password"
          label="Password"
          type="password"
          :rules="[(v) => (v && v.length > 6) || 'Enter password']"
        >
          <template v-slot:prepend><q-icon name="password" /></template>
        </q-input>
        <q-file
          v-model="avatar"
          filled
          accept=".jpg, image/*"
          :multiple="false"
          use-chips
          :rules="[(v) => v || 'Upload Avatar']"
          label="Avatar"
        />
        <q-card-actions>
          <q-card-section>
            <q-btn type="submit" icon="how_to_reg" label="Submit" />
          </q-card-section>
          <q-card-section>
            <q-btn
              align="right"
              icon="login"
              label="Login Instead"
              :to="{ name: 'login' }"
            />
          </q-card-section>
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
  name: 'CredentialPage',
  components: {},
  data() {
    return {
      displayName: '',
      email: '',
      password: '',
      avatar: undefined as File | undefined,
    };
  },
  mounted() {
    this.displayName = '';
    this.email = '';
    this.password = '';
  },
  methods: {
    async register() {
      const { email, password, displayName, avatar } = this;
      await profileStore.register({
        email,
        password,
        displayName,
        photo: avatar,
      });
      this.$q.notify({
        message: 'Successfully registered',
      });
      this.$router.replace('/');
    },
  },
});
</script>
<style></style>

