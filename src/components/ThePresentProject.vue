<template>
  <q-btn
    dense
    flat
    round
    :to="`/${activeProject}`"
    style="border: 2px solid gray; border-radius: 50px"
  >
    <q-img v-if="project" :src="project?.icon" sizes="lg" />
  </q-btn>
</template>

<script lang="ts">
import { IProject } from 'src/services';
import { useProjectStore } from 'src/stores/projects';
import { defineComponent } from 'vue';
const projectStore = useProjectStore();
export default defineComponent({
  name: 'ThePresentProject',
  components: {},
  data() {
    return {
      activeProject: '',
      projectStore,
      project: undefined as IProject | undefined,
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
    },
  },
});
</script>
<style></style>
