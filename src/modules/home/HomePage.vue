<template>
  <q-page class="justify-evenly q-pa-sm">
    <q-table grid :rows="projectStore.projects">
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <q-card>
            <q-card-section class="text-center">
              <strong>{{ props.row.name }}</strong>
            </q-card-section>
            <q-card-section
              horizontal
              @click="
                $router.replace({
                  name: 'Project',
                  params: { project: props.row.key },
                })
              "
            >
              <q-card-section>
                <q-btn round size="lg" dense>
                  <q-avatar size="xl">
                    <q-img v-if="props.row.icon" :src="props.row.icon" />
                    <q-img
                      v-else
                      src="img:icons/For-Presentation-150x150.png"
                      style="border: 5px solid gray; border-radius: 50px"
                    />
                  </q-avatar>
                </q-btn>
              </q-card-section>
              <q-card-section class="text-subtitle1 q-pa-sm">
                {{ props.row.description }}
              </q-card-section>
            </q-card-section>
            <q-card-actions>
              <q-btn
                v-if="!hasJoined(props.row)"
                @click.prevent="joinProject(props.row.key)"
                >Join</q-btn
              >
              <q-btn
                v-if="isAdminOf(props.row)"
                icon="edit"
                class="rounded"
                :to="'/' + props.row.key + '/edit'"
              />
              <q-btn
                v-if="isAdminOf(props.row)"
                icon="group"
                class="rounded"
                :to="{ name: 'members', params: { project: props.row.key } }"
              />
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script lang="ts">
import { IProject } from 'src/entities';
import { useProfilesStore } from 'src/stores/profiles.store';
import { useProjectStore } from 'src/stores/projects.store';
import { defineComponent } from 'vue';
const projectStore = useProjectStore();
const profilesStore = useProfilesStore();

export default defineComponent({
  name: 'IndexPage',
  components: {},
  data() {
    return {
      projectStore,
    };
  },
  methods: {
    hasJoined(project: IProject) {
      return (
        profilesStore.presentUser?.key &&
        [
          ...project.admins,
          ...project.moderators,
          ...project.members,
          ...project.pending,
        ].includes(profilesStore.presentUser?.key)
      );
    },
    isAdminOf(project: IProject) {
      return (
        profilesStore.presentUser?.key &&
        [...project.admins].includes(profilesStore.presentUser?.key)
      );
    },
    async joinProject(projectKey: string) {
      if (profilesStore.presentUser) {
        await projectStore.joinProject(
          projectKey,
          profilesStore.presentUser?.key
        );
        await this.$router.replace(`/${projectKey}/`);
      }
    },
  },
});
</script>
<style></style>
