<template>
  <div>
    <q-list padding class="menu-list">
      <q-item clickable :to="`/${project?.key}/iteration/new`">
        <q-item-section avatar>
          <q-icon name="add" />
        </q-item-section>
        <q-tooltip>New Iteration</q-tooltip>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { IProject } from 'src/entities';
import { useProjectStore } from 'src/stores/projects.store';
import { defineComponent } from 'vue';
const projectStore = useProjectStore();
export default defineComponent({
  name: 'ProjectActionList',
  components: {},
  data() {
    return {
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
      this.project = await projectStore.withKey(this.activeProject);
    },
  },
});
</script>
<style></style>
