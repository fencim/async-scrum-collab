<template>
  <q-page class="justify-evenly q-pa-sm">
    <q-table
      grid
      :rows="projectStore.projects"
      :pagination="{ rowsPerPage: 0 }"
      hide-bottom
    >
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <q-card class="cursor-pointer">
            <q-card-section class="text-center">
              <strong>{{ props.row.name }}</strong>
            </q-card-section>
            <q-card-section
              horizontal
              @click="
                hasJoined(props.row)
                  ? $router.replace({
                      name: 'projectHome',
                      params: { project: props.row.key },
                    })
                  : joinProject(props.row.key)
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
                icon="settings"
                class="rounded"
                :to="{
                  name: 'settings',
                  params: {
                    project: props.row.key,
                    part: props.row.pending?.length ? 'members' : 'taskboard',
                  },
                }"
              >
                <q-badge floating v-if="props.row.pending?.length">{{
                  props.row.pending?.length
                }}</q-badge>
              </q-btn>
              <q-space />
              <q-btn
                v-if="hasJoined(props.row)"
                dense
                round
                icon="notifications"
              >
                <q-badge floating rounded class="text-xs">{{
                  projectNotifications(props.row).length
                }}</q-badge>
                <q-menu>
                  <q-list>
                    <q-item
                      v-for="n in projectNotifications(props.row)"
                      :key="n.tag"
                      clickable
                      v-close-popup
                      @click="routeNotification(n)"
                    >
                      <q-item-section avatar>
                        <q-avatar>
                          <q-img :src="n.badge" v-if="n.badge" />
                          <q-icon name="person" v-else />
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ n.title }}</q-item-label>
                        <q-item-label caption>{{ n.body }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
              <q-icon v-else name="workspaces_filled" />
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script lang="ts">
import { TheDialogs } from 'src/dialogs/the-dialogs';
import { IProject } from 'src/entities';
import {
  useNotificationStore,
  NotificationInfo,
} from 'src/stores/notification.store';
import { useProfilesStore } from 'src/stores/profiles.store';
import { useProjectStore } from 'src/stores/projects.store';
import { defineComponent } from 'vue';
import { convoBus } from '../ceremony/convo-bus';
const projectStore = useProjectStore();
const profilesStore = useProfilesStore();
const notificationStore = useNotificationStore();
export default defineComponent({
  name: 'IndexPage',
  components: {},
  data() {
    return {
      projectStore,
      TheDialogs,
    };
  },
  methods: {
    projectNotifications(project: IProject) {
      return notificationStore.notifications.filter(
        (n) => n.log?.project == project.key
      );
    },
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
    routeNotification(item: NotificationInfo) {
      convoBus.emit('routeNotification', item.log);
      notificationStore.closeNotification(item);
    },
    async joinProject(projectKey: string) {
      const proj = projectStore.projects.find((p) => p.key == projectKey);
      this.$q.notify({
        position: 'center',
        message: `Join (${projectKey}) ${proj?.name || ''}?`,
        actions: [
          {
            label: 'Proceed',
            icon: 'login',
            handler: async () => {
              if (profilesStore.presentUser) {
                await projectStore.joinProject(
                  projectKey,
                  profilesStore.presentUser?.key
                );
                await this.$router.replace({
                  name: 'projectHome',
                  params: {
                    project: projectKey,
                  },
                });
              }
            },
          },
        ],
      });
    },
  },
});
</script>
<style></style>
