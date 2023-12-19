<template>
  <div>
    <q-list padding class="menu-list">
      <q-item
        clickable
        @click="
          TheDialogs.emit({
            type: 'newIteration',
            arg: {
              projectKey: activeProject,
            },
          })
        "
      >
        <q-item-section avatar>
          <q-icon name="add" />
        </q-item-section>
        <q-tooltip>New Iteration</q-tooltip>
      </q-item>
      <q-item
        clickable
        :to="{
          name: 'board',
          params: {
            project: project?.key,
          },
        }"
      >
        <q-item-section avatar>
          <q-icon name="dashboard" />
        </q-item-section>
        <q-tooltip>Task board</q-tooltip>
      </q-item>
      <q-item
        clickable
        :to="{
          name: 'projectHome',
          params: {
            project: project?.key,
          },
        }"
      >
        <q-item-section avatar>
          <q-icon name="view_timeline" />
        </q-item-section>
        <q-tooltip>Timeline</q-tooltip>
      </q-item>
      <q-item
        v-if="$route.params.iteration"
        clickable
        :to="{
          name: 'ceremony',
          params: {
            project: project?.key,
            iteration: $route.params.iteration,
            ceremony: $route.params.iteration + 'plan',
          },
        }"
      >
        <q-item-section avatar>
          <q-icon name="meeting_room" />
        </q-item-section>
        <q-tooltip>Planning Meeting</q-tooltip>
      </q-item>
      <q-item
        v-if="$route.params.iteration"
        clickable
        :to="{
          name: 'burn-down',
          params: {
            project: project?.key || activeProject,
            iteration: $route.params.iteration,
          },
        }"
      >
        <q-item-section avatar>
          <q-icon name="trending_down" />
        </q-item-section>
        <q-tooltip>Burn Down</q-tooltip>
      </q-item>
      <q-item
        clickable
        :to="{
          name: 'settings',
          params: {
            project: project?.key,
          },
        }"
      >
        <q-item-section avatar>
          <q-icon name="settings" />
        </q-item-section>
        <q-tooltip>Project Settings</q-tooltip>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { TheDialogs } from 'src/dialogs/the-dialogs';
import { IProject } from 'src/entities';
import { useProjectStore } from 'src/stores/projects.store';
import { defineComponent } from 'vue';
const projectStore = useProjectStore();
export default defineComponent({
  name: 'ProjectActionList',
  components: {},
  data() {
    return {
      TheDialogs,
      activeProject: 'AP',
      project: undefined as IProject | undefined,
    };
  },
  mounted() {
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
