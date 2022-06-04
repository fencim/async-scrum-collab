<template>
  <q-toolbar class="ticket-toobar">
    <the-present-project />
    <q-toolbar-title>
      <div class="text-subtitle2 text-uppercase q-pt-sm q-px-sm">
        <q-btn flat dense :to="`/${activeProject}`">{{ activeProject }}</q-btn>
        :
        <q-btn flat dense :to="`/${activeProject}/${activeIteration}`">{{
          iteration?.name
        }}</q-btn>
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
    </q-toolbar-title>
    <hour-glass v-if="ceremony" :start="ceremony.start" :end="ceremony.end" />
    <q-circular-progress
      :value="progress * 100"
      size="45px"
      show-value
      :thickness="0.1"
      color="grey"
      center-color="grey-8"
      class="q-ma-md"
    />
  </q-toolbar>
</template>

<script lang="ts">
import { useProfilesStore } from 'stores/profiles';
import { defineComponent } from 'vue';
import ThePresentProject from 'src/components/ThePresentProject.vue';
import HourGlass from 'src/components/HourGlass.vue';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { useIterationStore } from 'src/stores/iterations';
import { useProjectStore } from 'src/stores/projects';
import { useCeremonyStore } from 'src/stores/cermonies';
import { ICeremony, IIteration, IProfile, IProject } from 'src/services';
import { date } from 'quasar';

const projectStore = useProjectStore();
const profileStore = useProfilesStore();
const iterationStore = useIterationStore();
const ceremonyStore = useCeremonyStore();

export default defineComponent({
  name: 'CeremonyToolbar',
  components: { ThePresentProject, HourGlass, RecentActiveMembers },
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
      members: [] as IProfile[],
      timer: 0 as NodeJS.Timeout | 0,
    };
  },
  mounted() {
    this.init();
    this.timer = setInterval(async () => {
      this.members = await profileStore.fromKeyList(
        this.project?.members || []
      );
      const index = this.members.findIndex(
        (p) => p.key == profileStore.presentUser?.key
      );
      if (index > 0) {
        const [user] = this.members.splice(index, 1);
        this.members.splice(0, 0, user);
      }
    }, 1000);
  },
  unmounted() {
    this.timer && clearInterval(this.timer);
  },
  updated() {
    this.init();
  },
  computed: {
    progress() {
      return ceremonyStore.activeCeremonyProgress;
    },
  },
  methods: {
    async init() {
      this.activeProject =
        (this.$route.params.project && String(this.$route.params.project)) ||
        '';
      this.project = await projectStore.withKey(this.activeProject);
      this.activeIteration =
        (this.$route.params.iteration &&
          String(this.$route.params.iteration)) ||
        '';
      this.iteration = await iterationStore.withKey(
        this.activeProject,
        this.activeIteration
      );
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
