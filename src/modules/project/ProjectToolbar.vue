<template>
  <q-toolbar class="ticket-toobar">
    <the-present-project />
    <q-toolbar-title>
      <div class="text-h5 q-pt-sm q-px-sm">{{ project?.name }}</div>
      <div class="text-overline q-px-sm bg-grey-10 rounded-borders">
        {{ project?.description }}
      </div>
      <recent-active-members :profiles="memebers" />
    </q-toolbar-title>
    <the-present-user />
  </q-toolbar>
</template>

<script lang="ts">
import { useProfilesStore } from 'src/stores/profiles.store';
import { defineComponent } from 'vue';
import ThePresentUser from 'components/ThePresentUser.vue';
import ThePresentProject from 'src/components/ThePresentProject.vue';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { useProjectStore } from 'src/stores/projects.store';
import { IProfile, IProject } from 'src/entities';
const projectStore = useProjectStore();

export default defineComponent({
  name: 'ProjectToolbar',

  components: { ThePresentUser, ThePresentProject, RecentActiveMembers },
  data() {
    return {
      projectStore,
      profilesStore: useProfilesStore(),
      showToday: true,
      activeProject: '',
      project: undefined as IProject | undefined,
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
      this.memebers = (
        await this.profilesStore.fromKeyList(this.project?.members || [])
      ).filter((p) => p);
    },
  },
});
</script>
<style></style>
