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
            :label="projectStore.activeProject?.key"
            :to="{ name: 'projectHome', params: { project: activeProject } }"
          />
          <q-breadcrumbs-el
            :label="iterationStore.activeIteration?.name"
            :to="{
              name: 'iteration',
              params: {
                project: activeProject,
                iteration: activeIteration,
              },
            }"
          />
        </q-breadcrumbs>
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

    <the-synchronizer />
    <the-present-user />
  </q-toolbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ThePresentProject from 'src/components/ThePresentProject.vue';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { useIterationStore } from 'src/stores/iterations.store';
import { useProjectStore } from 'src/stores/projects.store';
import { date } from 'quasar';
import { useActiveStore } from 'src/stores/active.store';
import TheSynchronizer from 'src/components/TheSynchronizer.vue';
import ThePresentUser from 'src/components/ThePresentUser.vue';

const activeStore = useActiveStore();
const projectStore = useProjectStore();
const iterationStore = useIterationStore();

export default defineComponent({
  name: 'ProjectToolbar',

  components: {
    ThePresentProject,
    RecentActiveMembers,
    TheSynchronizer,
    ThePresentUser,
  },
  data() {
    return {
      date,
      projectStore,
      iterationStore,
      showToday: true,
      activeProject: '',
      activeIteration: '',
    };
  },
  computed: {
    members() {
      return [...activeStore.activeMembers, ...activeStore.guests];
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
