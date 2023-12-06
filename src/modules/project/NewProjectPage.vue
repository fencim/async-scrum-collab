<template>
  <q-page class="justify-evenly q-pa-sm">
    <q-form @submit="submitNewProject">
      <q-card>
        <q-toolbar>
          <q-avatar>
            <img src="/icons/favicon-128x128.png" />
          </q-avatar>
          <q-toolbar-title
            ><span class="text-weight-bold">{{
              $route.params.project ? 'Edit' : 'New'
            }}</span>
            Project</q-toolbar-title
          >

          <q-btn flat round dense icon="close" to="/" />
        </q-toolbar>

        <q-card-section>
          <q-input
            v-model="theProject.key"
            label="Key"
            maxlength="4"
            mask="XXXX"
            :disable="saving"
            :rules="[
              (v) => (v && /^[0-9A-Z]{4}$/i.test(v)) || '4 digit project code',
              (v) =>
                (v &&
                  !projectStore.projects.find(
                    (p) => !$route.params.project && p.key == v
                  )) ||
                v + ' project key is not available',
            ]"
          />
          <q-input
            v-model="theProject.name"
            label="Name"
            :disable="saving"
            :rules="[(v) => (v && v.length > 0) || 'Enter Project Name']"
          />
          <q-input
            v-model="theProject.description"
            label="Description"
            filled
            :disable="saving"
            type="textarea"
          />
          <q-file
            v-if="!icon"
            v-model="icon"
            filled
            accept=".jpg, image/*"
            :multiple="false"
            use-chips
            label="Select logo"
          />
          <div v-else class="col-4">
            <span>Icon</span>
            <the-image-cropper :file="[icon]" @cropImage="cropImage" />
          </div>

          <q-select
            class="col-12"
            emit-value
            label="Members"
            map-options
            multiple
            :disable="saving"
            v-model="theProject.members"
            :options="profile.profiles"
            :option-label="'name'"
            option-value="key"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn type="submit" :loading="saving">Save</q-btn>
        </q-card-actions>
      </q-card>
    </q-form>
  </q-page>
</template>

<script lang="ts">
import { IProject } from 'src/entities';
import { useProfilesStore } from 'src/stores/profiles.store';
import { useProjectStore } from 'src/stores/projects.store';
import { defineComponent } from 'vue';
import TheImageCropper from 'src/components/TheImageCropper.vue';
const projectStore = useProjectStore();
const profileStore = useProfilesStore();
export default defineComponent({
  name: 'SaveProjectPage',
  components: { TheImageCropper },
  data() {
    return {
      projectStore,
      profile: profileStore,
      theProject: {
        key: '',
        name: '',
        members: [],
        pending: [],
        admins: [],
        moderators: [],
        guests: [],
      } as IProject,
      icon: undefined as File | undefined,
    };
  },
  setup() {
    return {
      croppedImg: undefined as File | undefined,
      cropImg: '',
      saving: false,
    };
  },
  async mounted() {
    await profileStore.init();
    if (this.$route.params.project) {
      this.theProject = projectStore.activeProject as IProject;
    }
  },
  methods: {
    async submitNewProject() {
      try {
        this.saving = true;
        if (profileStore.theUser) {
          this.theProject.admins = [profileStore.theUser.key];
        }

        await projectStore.saveProject(
          this.theProject as IProject,
          this.croppedImg || this.icon
        );

        this.$router.replace({
          name: 'projectHome',
          params: {
            project: this.theProject?.key,
          },
        });
      } catch (e) {
        this.$q.notify({
          message: String((e as { code: string }).code || e),
          position: 'top',
          color: 'negative',
        });
      }
    },
    cropImage(img: string) {
      this.cropImg = img;
      if (this.cropImg) {
        this.croppedImg = this.dataURLtoFile(
          this.cropImg,
          this.icon?.name || ''
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
