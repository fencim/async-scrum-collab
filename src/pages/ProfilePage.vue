<template>
  <q-page class="justify-evenly q-pa-sm">
    <q-card>
      <q-toolbar>
        <q-btn flat rounded icon="arrow_back" @click="$router.back()" />
        <q-space />
        <q-btn flat rounded icon="home" :to="{ name: 'home' }" />
      </q-toolbar>
      <q-card-section horizontal v-if="profile">
        <q-card-section>
          <q-avatar size="100px">
            <img
              v-if="profile && profile.avatar"
              :src="profile.avatar"
              oncontextmenu="return false;"
            />
            <span v-else class="text-uppercase">{{
              initials(profile.name)
            }}</span>
          </q-avatar>
        </q-card-section>
        <q-card-section v-if="online">
          <div class="text-h6">{{ profile.name }}</div>
          <div>{{ profile.email }}</div>
          <div>
            <q-chip dense icon="explore" color="secondary">{{
              date.formatDate(online.lastActivityTime, 'YYYY MMM DD HH:mm A')
            }}</q-chip>
            <q-chip dense v-if="online.activeProject" color="secondary">{{
              online.activeProject
            }}</q-chip>
            <q-chip dense v-if="online.activeIteration" color="secondary">{{
              online.activeIteration
            }}</q-chip>
            <q-chip dense v-if="online.activeCeremony" color="secondary">{{
              online.activeCeremony
            }}</q-chip>
            <q-chip dense v-if="online.activeConvos" color="secondary">{{
              online.activeConvos
            }}</q-chip>
          </div>
        </q-card-section>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-table
          grid
          :rows="projects"
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
                    $router.replace({
                      name: 'projectHome',
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
                <q-card-section>
                  <q-chip
                    class="text-capitalize"
                    color="primary"
                    v-for="role in props.row.roles"
                    :key="role"
                    >{{ role }}</q-chip
                  >
                </q-card-section>
              </q-card>
            </div>
          </template>
        </q-table>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-timeline color="secondary">
          <q-timeline-entry
            v-for="activity in activities"
            :key="activity.date"
            :avatar="activity.badge || undefined"
            :title="activity.title"
            :subtitle="date.formatDate(activity.date, 'YYYY MMM DD HH:mm A')"
          >
            <div
              class="cursor-pointer"
              @click="routeActivity(activity.log)"
              v-html="activity.body"
            ></div>
          </q-timeline-entry>
        </q-timeline>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { useProfilesStore } from 'src/stores/profiles.store';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ILoggable, IOnlineUser, IProfile, IProject } from 'src/entities';
import { useProjectStore } from 'src/stores/projects.store';
import { useOnlineUsersStore } from 'src/stores/online-users.store';
import { date } from 'quasar';
import { useTransactionLogsStore } from 'src/stores/transaction-log-store';
import { translateLogToNotification } from 'src/notification.translator';
import { convoBus } from 'src/modules/ceremony/convo-bus';

interface IWorkingProject extends IProject {
  roles: string[];
}
interface Activity {
  title: string;
  body: string;
  badge?: string;
  date: string;
  log: ILoggable;
}
const $route = useRoute();
const $router = useRouter();
const profileStore = useProfilesStore();
const projectStore = useProjectStore();
const onlineStore = useOnlineUsersStore();
const transactionStore = useTransactionLogsStore();
const profile = ref<IProfile>();
const online = ref<IOnlineUser>();
const projects = ref<IWorkingProject[]>([]);
const activities = ref<Activity[]>([]);

onMounted(async () => {
  if (typeof $route.params.profile == 'string') {
    profile.value = await profileStore.get($route.params.profile);
  } else {
    $router.replace({ name: 'home' });
    return;
  }
  online.value = await onlineStore.get(profile.value?.key || '');
  projects.value = projectStore.projects.reduce((list, p) => {
    const roles: string[] = [];
    if (p.members.includes(profile.value?.key || '')) {
      roles.push('member');
    }
    if (p.moderators.includes(profile.value?.key || '')) {
      roles.push('moderator');
    }
    if (p.admins.includes(profile.value?.key || '')) {
      roles.push('admin');
    }
    if (roles.length) {
      list.push({
        roles,
        ...p,
      });
    }
    return list;
  }, [] as IWorkingProject[]);
  if (online.value) {
    const logs = await transactionStore.findTransactions({
      operator: online.value.key,
      project: online.value.activeProject,
    });
    activities.value = await Promise.all(
      logs.map(async (log) => {
        const info = await translateLogToNotification(log);
        return {
          ...info,
          log,
        };
      })
    );
  }
});
function initials(name?: string) {
  const m = (name || 'C U').match(/\b\w/g);
  return `${m && m[0]}${m && m[1]}`;
}
function routeActivity(log: ILoggable) {
  convoBus.emit('routeNotification', log);
}
</script>
<style></style>
