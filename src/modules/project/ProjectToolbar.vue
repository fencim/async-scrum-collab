<template>
  <q-toolbar class="ticket-toobar">
    <the-present-project />
    <q-toolbar-title>
      <div class="text-h5 q-pt-sm q-px-sm">{{ project?.name }}</div>
      <div class="text-overline q-px-sm bg-grey-10 rounded-borders">
        {{ project?.description }}
      </div>
      <recent-active-members v-if="members.length" :profiles="members" />
      <q-chip
        v-else
        color="negative"
        clickable
        @click="
          $router.push({
            name: 'settings',
            params: {
              project: activeProject,
            },
          })
        "
        >No members working on this project!</q-chip
      >
    </q-toolbar-title>
    <the-synchronizer />
    <the-present-user />
  </q-toolbar>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUpdated } from 'vue';
import ThePresentUser from 'components/ThePresentUser.vue';
import ThePresentProject from 'src/components/ThePresentProject.vue';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { useProjectStore } from 'src/stores/projects.store';
import { IProject } from 'src/entities';
import { useActiveStore } from 'src/stores/active.store';
import TheSynchronizer from 'src/components/TheSynchronizer.vue';
import { useRoute } from 'vue-router';
const projectStore = useProjectStore();
const activeStore = useActiveStore();
const activeProject = ref('');
const project = ref<IProject>();

const members = computed(() => {
  return [
    ...activeStore.moderators,
    ...activeStore.activeMembers,
    ...activeStore.guests,
  ].filter(
    (p, index, self) =>
      index == self.findIndex((x) => x?.key && x.key === p.key)
  );
});
const $route = useRoute();
onMounted(init);
onUpdated(init);
async function init() {
  activeProject.value =
    ($route.params.project && String($route.params.project)) || '';
  project.value = projectStore.activeProject;
}
</script>
<style></style>
