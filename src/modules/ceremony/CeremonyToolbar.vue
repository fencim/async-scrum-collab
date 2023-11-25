<template>
  <q-toolbar class="ticket-toobar">
    <the-present-project />
    <q-toolbar-title>
      <div class="text-subtitle2 text-uppercase q-pt-sm q-px-sm">
        <q-btn
          flat
          dense
          :to="{ name: 'Project', params: { project: activeProject } }"
          >{{ activeProject }}</q-btn
        >
        :
        <q-btn
          flat
          dense
          :to="{
            name: 'iteration',
            params: {
              project: activeProject,
              iteration: activeIteration,
            },
          }"
          >{{ iteration?.name }}</q-btn
        >
        : {{ ceremony?.type.toUpperCase() }}
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
      <recent-active-members :profiles="members" @ctrl-click="setAsUser" />
      <q-linear-progress :value="ceremony?.progress" />
    </q-toolbar-title>
    <hour-glass v-if="ceremony" :start="ceremony.start" :end="ceremony.end" />
    <the-present-user />
  </q-toolbar>
</template>

<script lang="ts">
import { useProfilesStore } from 'src/stores/profiles.store';
import { defineComponent } from 'vue';
import ThePresentUser from 'components/ThePresentUser.vue';
import ThePresentProject from 'src/components/ThePresentProject.vue';
import HourGlass from 'src/components/HourGlass.vue';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { useIterationStore } from 'src/stores/iterations.store';
import { useProjectStore } from 'src/stores/projects.store';
import { useCeremonyStore } from 'src/stores/cermonies.store';
import { ICeremony, IIteration, IProfile, IProject } from 'src/entities';
import { date } from 'quasar';
import { useActiveStore } from 'src/stores/active.store';

const projectStore = useProjectStore();
const profileStore = useProfilesStore();
const activeStore = useActiveStore();
const iterationStore = useIterationStore();
const ceremonyStore = useCeremonyStore();

export default defineComponent({
  name: 'CeremonyToolbar',
  components: {
    ThePresentProject,
    HourGlass,
    RecentActiveMembers,
    ThePresentUser,
  },
  data() {
    return {
      date,
      profileStore,
      showToday: true,
      activeProject: 'AP',
      activeIteration: 'AI',
      activeCeremony: 'AC',
      activeItem: '0',
      project: undefined as IProject | undefined,
      iteration: undefined as IIteration | undefined,
      ceremony: undefined as ICeremony | undefined,
    };
  },
  mounted() {
    this.init();
  },
  updated() {
    this.init();
  },
  computed: {
    members() {
      return [...activeStore.activeMembers, ...activeStore.guests];
    },
    progress() {
      return ceremonyStore.activeCeremonyProgress;
    },
  },
  methods: {
    async init() {
      this.activeProject =
        (this.$route.params.project && String(this.$route.params.project)) ||
        '';
      this.project = projectStore.activeProject;
      this.activeIteration =
        (this.$route.params.iteration &&
          String(this.$route.params.iteration)) ||
        '';
      this.iteration = iterationStore.activeIteration;
      this.activeCeremony =
        (this.$route.params.ceremony && String(this.$route.params.ceremony)) ||
        '';
      this.ceremony = await ceremonyStore.withKey(
        this.activeProject,
        this.activeIteration,
        this.activeCeremony
      );
      this.activeItem =
        (this.$route.params.item && String(this.$route.params.item)) || '';
    },
    setAsUser(profile?: IProfile) {
      if (profile?.key) {
        profileStore.setAsTheUser(profile.key);
      }
    },
  },
});
</script>
<style></style>
