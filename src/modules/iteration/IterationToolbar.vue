<template>
  <q-toolbar class="ticket-toobar">
    <the-present-project />
    <q-toolbar-title>
      <div class="text-subtitle2 text-uppercase q-pt-sm q-px-sm">
        <q-btn flat dense :to="`/${activeProject}`">{{
          projectStore.activeProject?.key
        }}</q-btn>
        : {{ iterationStore.activeIteration?.name }}
      </div>
      <div
        class="text-overline q-px-sm bg-grey-10 rounded-borders"
        v-if="iterationStore.activeIteration"
      >
        {{
          date.formatDate(iterationStore.activeIteration?.start, 'MMM DD, YYYY')
        }}
        -
        {{
          date.formatDate(iterationStore.activeIteration?.end, 'MMM DD, YYYY')
        }}
        ({{
          date.getDateDiff(
            iterationStore.activeIteration?.end,
            iterationStore.activeIteration?.start,
            'days'
          )
        }}
        days)
      </div>
      <recent-active-members :profiles="members" />
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
import { useProfilesStore } from 'src/stores/profiles.store';
import { defineComponent } from 'vue';
import ThePresentProject from 'src/components/ThePresentProject.vue';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { useIterationStore } from 'src/stores/iterations.store';
import { useProjectStore } from 'src/stores/projects.store';
import { date } from 'quasar';

const profilesStore = useProfilesStore();
const projectStore = useProjectStore();
const iterationStore = useIterationStore();

export default defineComponent({
  name: 'ProjectToolbar',

  components: { ThePresentProject, RecentActiveMembers },
  data() {
    return {
      date,
      profilesStore,
      projectStore,
      iterationStore,
      showToday: true,
      activeProject: '',
      activeIteration: '',
    };
  },
  computed: {
    members() {
      return profilesStore.members;
    },
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
      this.activeIteration =
        (this.$route.params.iteration &&
          String(this.$route.params.iteration)) ||
        '';
    },
  },
});
</script>
<style></style>
