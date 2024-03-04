<template>
  <q-toolbar class="ticket-toobar">
    <the-present-project />
    <q-toolbar-title>
      <div class="text-subtitle2 text-uppercase q-pt-sm q-px-sm">
        <q-breadcrumbs>
          <template v-slot:separator>
            <q-icon size="1.5em" name="chevron_right" color="primary" />
          </template>
          <q-breadcrumbs-el icon="home" :to="{ name: 'home' }" />
          <q-breadcrumbs-el
            :label="activeProject"
            :to="{ name: 'projectHome', params: { project: activeProject } }"
          />
          <q-breadcrumbs-el
            :label="iteration?.name"
            :to="{
              name: 'iteration',
              params: {
                project: activeProject,
                iteration: activeIteration,
              },
            }"
          />
          <q-breadcrumbs-el
            :to="{
              name: 'ceremony',
              params: {
                project: activeProject,
                iteration: activeIteration,
                ceremony: activeCeremony,
              },
            }"
            >{{ ceremony?.type.toUpperCase() }}
            <q-badge v-if="ceremony?.type == 'scrum'" class="q-ml-sm">
              {{ date.formatDate(ceremony.start, 'MMM D') }}
            </q-badge>
          </q-breadcrumbs-el>
          <q-breadcrumbs-el v-if="item">
            <q-card
              class="list-group-item board-card no-shadow"
              :class="item.type + '-card'"
            >
              <component
                :is="getComponent(item)"
                :task="item"
                header-only
                no-action
                mini
                chip-only
              />
            </q-card>
          </q-breadcrumbs-el>
        </q-breadcrumbs>
      </div>
      <div
        class="text-subtitle2 q-px-sm bg-grey-10 rounded-borders"
        v-if="ceremony"
      >
        {{ date.formatDate(ceremony.start, 'MMM DD, YYYY hh:mm A') }} -
        {{ date.formatDate(ceremony.end, 'hh:mm A') }} ({{
          date.getDateDiff(ceremony.end, ceremony.start, 'hours')
        }}
        hours)
      </div>
      <recent-active-members
        :profiles="members"
        :max-count="15"
        @ctrl-click="setAsUser"
      />
      <q-linear-progress :value="progress" />
    </q-toolbar-title>

    <div class="absolute-top-right q-ma-sm row">
      <the-synchronizer />
      <hour-glass
        class="self-center q-mx-sm"
        v-if="ceremony"
        :start="ceremony.start"
        :end="ceremony.end"
      />
      <the-present-user />
    </div>
  </q-toolbar>
</template>

<script lang="ts" setup>
import { useProfilesStore } from 'src/stores/profiles.store';
import { ref, computed, onMounted } from 'vue';
import ThePresentUser from 'components/ThePresentUser.vue';
import ThePresentProject from 'src/components/ThePresentProject.vue';
import HourGlass from 'src/components/HourGlass.vue';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { useIterationStore } from 'src/stores/iterations.store';
import { useProjectStore } from 'src/stores/projects.store';
import { useCeremonyStore } from 'src/stores/ceremonies.store';
import { ICeremony, IIteration, IProfile, IProject } from 'src/entities';
import { date } from 'quasar';
import { useActiveStore } from 'src/stores/active.store';
import TheSynchronizer from 'src/components/TheSynchronizer.vue';
import { useRoute } from 'vue-router';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { getComponent } from '../task-board/card-components';
import { useRouter } from 'vue-router';

const projectStore = useProjectStore();
const profileStore = useProfilesStore();
const activeStore = useActiveStore();
const iterationStore = useIterationStore();
const ceremonyStore = useCeremonyStore();
const discussionStore = useDiscussionStore();
const $route = useRoute();
const $router = useRouter();
const activeProject = ref('AP');
const activeIteration = ref('AI');
const activeCeremony = ref('AC');
const activeItem = ref('0');
const project = ref<IProject>();
const iteration = ref<IIteration>();
const ceremony = ref<ICeremony>();
const item = computed(() => {
  return discussionStore.discussions.find((d) => d.key == activeItem.value);
});
const members = computed(() => {
  return [...activeStore.activeMembers, ...activeStore.guests];
});
const progress = computed(() => {
  return ceremonyStore.activeCeremonyProgress;
});

onMounted(init);
$router.afterEach(init);

async function init() {
  activeProject.value =
    ($route.params.project && String($route.params.project)) || '';
  project.value = projectStore.activeProject;
  activeIteration.value =
    ($route.params.iteration && String($route.params.iteration)) || '';
  iteration.value =
    iterationStore.activeIteration ||
    (await iterationStore.getIteration(activeIteration.value));
  activeCeremony.value =
    ($route.params.ceremony && String($route.params.ceremony)) || '';
  ceremony.value = await ceremonyStore.withKey(
    activeProject.value,
    activeIteration.value,
    activeCeremony.value
  );
  activeItem.value = ($route.params.item && String($route.params.item)) || '';
}
function setAsUser(profile?: IProfile) {
  if (profile?.key) {
    profileStore.setAsTheUser(profile.key);
  }
}
</script>
<style></style>
