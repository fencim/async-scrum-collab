<template>
  <q-page class="justify-evenly q-pa-sm">
    <div v-if="iterations.length">
      <iteration-timeline
        v-for="i in iterations"
        :key="i.key"
        :project="activeProject"
        :iteration="i"
      />
    </div>
    <div v-else>
      <MarkdownPreview :source="gettingStarted" />
    </div>
  </q-page>
</template>

<script lang="ts">
import MarkdownPreview from '@uivjs/vue-markdown-preview';
import { IProject } from 'src/entities';
import { useIterationStore } from 'src/stores/iterations.store';
import { useProjectStore } from 'src/stores/projects.store';
import { defineComponent } from 'vue';
import IterationTimeline from './IterationTimeline.vue';
import gettingStarted from 'src/guides/getting-project-started.guide.md?raw';
const projectStore = useProjectStore();
const iterationStore = useIterationStore();

export default defineComponent({
  name: 'ProjectPage',
  components: { IterationTimeline, MarkdownPreview },
  data() {
    return {
      projectStore,
      iterationStore,
      gettingStarted,
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
