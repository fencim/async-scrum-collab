<template>
  <q-btn
    dense
    flat
    round
    size="xl"
    :to="{
      name: 'Project',
      params: { project: projectStore.activeProject?.key },
    }"
    :style="
      projectStore.activeProject
        ? 'border: 2px solid gray; border-radius: 50px'
        : ''
    "
  >
    <q-avatar size="xl">
      <q-img
        v-if="projectStore.activeProject"
        :src="projectStore.activeProject?.icon"
        sizes="xl"
      />
      <q-img v-else src="icons/asc-icon.png" sizes="xl" />
    </q-avatar>
  </q-btn>
</template>

<script lang="ts">
import { useProjectStore } from 'src/stores/projects.store';
import { defineComponent } from 'vue';
const projectStore = useProjectStore();
export default defineComponent({
  name: 'ThePresentProject',
  components: {},
  data() {
    return {
      activeProject: '',
      projectStore,
    };
  },
});
</script>
<style></style>
