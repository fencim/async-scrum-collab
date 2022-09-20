<template>
  <q-page class="justify-evenly q-pa-sm">
    <iteration-timeline
      v-for="i in iterations"
      :key="i.key"
      :project="activeProject"
      :iteration="i"
    />
  </q-page>
</template>

<script lang="ts">
import { IProject } from 'src/entities';
import { useIterationStore } from 'src/stores/iterations.store';
import { useProjectStore } from 'src/stores/projects.store';
import { defineComponent } from 'vue';
import IterationTimeline from './IterationTimeline.vue';

const projectStore = useProjectStore();
const iterationStore = useIterationStore();

export default defineComponent({
  name: 'ProjectPage',
  components: { IterationTimeline },
  data() {
    return {
      projectStore,
      iterationStore,
      activeProject: '',
      project: undefined as IProject | undefined,
      activeIteration: '',
    };
  },
  computed: {
    iterations() {
      return iterationStore.iterations;
    },
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
      if (!this.project) {
        this.$router.replace('/');
      }
      this.activeIteration =
        (this.$route.params.iteration &&
          String(this.$route.params.iteration)) ||
        '';
    },
  },
});
</script>
<style></style>
