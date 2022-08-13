<template>
  <q-page class="justify-evenly q-pa-sm">
    <q-form @submit="submitNewProject">
      <q-card>
        <q-toolbar>
          <q-avatar>
            <img src="icons/favicon-128x128.png" />
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
            :rules="[(v) => (v && v.length > 0) || 'Enter Project Name']"
          />
          <q-input
            v-model="theProject.description"
            label="Description"
            filled
            type="textarea"
          />
          <q-file
            v-model="icon"
            filled
            accept=".jpg, image/*"
            :multiple="false"
            use-chips
            label="Select logo"
          />
          <q-select
            class="col-12"
            emit-value
            label="Members"
            map-options
            multiple
            v-model="theProject.members"
            :options="profile.profiles"
            :option-label="'name'"
            option-value="key"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn type="submit">Save</q-btn>
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
const projectStore = useProjectStore();
const profileStore = useProfilesStore();
export default defineComponent({
  name: 'SaveProjectPage',
  components: {},
  data() {
    return {
      projectStore,
      profile: profileStore,
      theProject: {} as IProject,
      icon: undefined as File | undefined,
    };
  },
  async mounted() {
    await profileStore.init();
    if (this.$route.params.project) {
      this.theProject =
        (await projectStore.withKey(this.$route.params.project as string)) ||
        this.theProject;
    }
  },
  methods: {
    async submitNewProject() {
      await projectStore.saveProject(this.theProject, this.icon);
      this.$router.replace('/' + this.theProject.key);
    },
  },
});
</script>
<style></style>
