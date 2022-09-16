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
          :rules="[
            (v) =>
              /^(?=.*[A-Z])(?=.*[_!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/.test(
                v || ''
              ) || 'Enter strong password',
          ]"
        >
          <template v-slot:prepend><q-icon name="password" /></template>
        </q-input>
        <q-input
          v-model="confirmPass"
          label="Confirm Password"
          type="password"
          :rules="[
            (v) => (v && v === password) || 'Confirm password does not match',
          ]"
        >
          <template v-slot:prepend><q-icon name="password" /></template>
        </q-input>

        <q-file
          v-if="!avatar"
          v-model="avatar"
          filled
          accept=".jpg, image/*"
          :multiple="false"
          use-chips
          :rules="[(v) => v || 'Upload Avatar']"
          label="Avatar"
        />
        <div v-else>
          <span>Avatar</span>
          <the-image-cropper :file="[avatar]" @cropImage="cropImage" />
        </div>
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
import TheImageCropper from 'src/components/TheImageCropper.vue';
const profileStore = useProfilesStore();

export default defineComponent({
  name: 'CredentialPage',
  components: { TheImageCropper },
  data() {
    return {
      displayName: '',
      email: '',
      password: '',
      confirmPass: '',
      avatar: undefined as File | undefined,
    };
  },
  setup() {
    return {
      croppedAvatar: undefined as File | undefined,
      cropImg: '',
    };
  },
  mounted() {
    this.displayName = '';
    this.email = '';
    this.password = '';
  },
  methods: {
    async register() {
      const { email, password, displayName, croppedAvatar, avatar } = this;
      try {
        await profileStore.register({
          email,
          password,
          displayName,
          photo: croppedAvatar || avatar,
        });
        this.$q.notify({
          message: 'Successfully registered',
        });
        this.$router.replace('/');
      } catch (e) {
        this.$q.notify({
          message: (e as { message: string }).message,
          color: 'negative',
          position: 'top',
        });
      }
    },
    cropImage(img: string) {
      this.cropImg = img;
      if (this.cropImg) {
        this.croppedAvatar = this.dataURLtoFile(
          this.cropImg,
          this.avatar?.name || ''
        );
      }
    },
    dataURLtoFile(dataUrl: string, fileName: string) {
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], fileName, { type: mime });
    },
  },
});
</script>
<style></style>
