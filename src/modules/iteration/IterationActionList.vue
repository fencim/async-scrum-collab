<template>
  <div>
    <q-list padding class="menu-list">
      <q-item clickable :to="`/${project?.key}/${iteration?.key}/ceremony/new`">
        <q-item-section avatar>
          <q-icon name="schedule" />
        </q-item-section>
        <q-tooltip>Schedule an iteration meeting</q-tooltip>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { IIteration, IProject } from 'src/entities';
import { useIterationStore } from 'src/stores/iterations.store';
import { useProjectStore } from 'src/stores/projects.store';
import { defineComponent } from 'vue';
const iterationStore = useIterationStore();
const projectStore = useProjectStore();
export default defineComponent({
  name: 'IterationActionList',
  components: {},
  data() {
    return {
      activeProject: 'AP',
      activeIteration: 'AI',
      iteration: undefined as IIteration | undefined,
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
      this.activeIteration =
        (this.$route.params.iteration &&
          String(this.$route.params.iteration)) ||
        '';
      this.iteration = iterationStore.activeIteration;
    },
  },
});
</script>
<style></style>
