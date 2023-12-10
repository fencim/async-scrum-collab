<template>
  <q-toolbar class="ticket-toobar">
    <the-present-project />
    <q-toolbar-title>
      <div class="text-h5 q-pt-sm q-px-sm">{{ project?.name }}</div>
      <div class="text-overline q-px-sm bg-grey-10 rounded-borders">
        {{ project?.description }}
      </div>
      <recent-active-members :profiles="members" />
    </q-toolbar-title>
    <the-synchronizer />
    <the-present-user />
  </q-toolbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ThePresentUser from 'components/ThePresentUser.vue';
import ThePresentProject from 'src/components/ThePresentProject.vue';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { useProjectStore } from 'src/stores/projects.store';
import { IProject } from 'src/entities';
import { useActiveStore } from 'src/stores/active.store';
import TheSynchronizer from 'src/components/TheSynchronizer.vue';
const projectStore = useProjectStore();
const activeStore = useActiveStore();
export default defineComponent({
  name: 'ProjectToolbar',

  components: {
    ThePresentUser,
    ThePresentProject,
    RecentActiveMembers,
    TheSynchronizer,
  },
  data() {
    return {
      projectStore,
      activeStore,
      showToday: true,
      activeProject: '',
      project: undefined as IProject | undefined,
    };
  },
  computed: {
    members() {
      return [
        ...activeStore.moderators,
        ...activeStore.activeMembers,
        ...activeStore.guests,
      ].filter(
        (p, index, self) =>
          index == self.findIndex((x) => x?.key && x.key === p.key)
      );
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
      this.project = projectStore.activeProject;
    },
  },
});
</script>
<style></style>
