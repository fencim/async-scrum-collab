<template>
  <q-toolbar class="ticket-toobar">
    <the-present-project />
    <q-toolbar-title>
      <div class="text-subtitle2 text-uppercase q-pt-sm q-px-sm">
        <q-btn flat dense :to="`/${activeProject}`">{{ project?.key }}</q-btn>
        : {{ iteration?.name }}
      </div>
      <div
        class="text-overline q-px-sm bg-grey-10 rounded-borders"
        v-if="iteration"
      >
        {{ date.formatDate(iteration?.start, 'MMM DD, YYYY') }} -
        {{ date.formatDate(iteration?.end, 'MMM DD, YYYY') }} ({{
          date.getDateDiff(iteration?.end, iteration?.start, 'days')
        }}
        days)
      </div>
      <recent-active-members :profiles="memebers" />
    </q-toolbar-title>
    <q-btn
      dense
      round
      icon="calendar_month"
      :to="
        '/' +
        (activeProject || 'AP') +
        '/' +
        (activeIteration || 'AI') +
        '/today'
      "
    />
  </q-toolbar>
</template>

<script lang="ts">
import { useProfilesStore } from 'stores/profiles';
import { defineComponent } from 'vue';
import ThePresentProject from 'src/components/ThePresentProject.vue';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { useIterationStore } from 'src/stores/iterations';
import { useProjectStore } from 'src/stores/projects';
import { IIteration, IProfile, IProject } from 'src/services';
import { date } from 'quasar';

const projectStore = useProjectStore();
const iterationStore = useIterationStore();

export default defineComponent({
  name: 'ProjectToolbar',

  components: { ThePresentProject, RecentActiveMembers },
  data() {
    return {
      date,
      profilesStore: useProfilesStore(),
      showToday: true,
      activeProject: '',
      activeIteration: '',
      project: undefined as IProject | undefined,
      iteration: undefined as IIteration | undefined,
      memebers: [] as IProfile[],
    };
  },
  mounted() {
    this.init();
  },
  updated() {
    this.init();
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
      this.memebers = await this.profilesStore.fromKeyList(
        this.project?.members || []
      );
    },
  },
});
</script>
<style></style>
