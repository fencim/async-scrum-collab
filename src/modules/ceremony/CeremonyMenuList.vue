<template>
  <q-list padding class="menu-list" style="overflow-y: auto">
    <q-item
      v-if="activeCeremony"
      clickable
      :active="!activeItemKey"
      active-class="bg-grey-9"
      :to="{
        name: 'ceremony',
        params: {
          project: activeProjectKey,
          iteration: activeIterationKey,
          ceremony: activeCeremonyKey,
        },
      }"
    >
      <q-circular-progress
        :value="Number(activeCeremony.progress) * 100"
        show-value
        font-size="12px"
        class="text-white q-ma-sm text-uppercase"
        size="40px"
        :thickness="0.2"
        color="grey"
        track-color="black"
      >
        {{ (Number(activeCeremony.progress || 0) * 100).toFixed(0) }}%
      </q-circular-progress>
      <q-tooltip
        ><div class="text-caption">Convo of {{ activeCeremony?.type }}</div>
        <q-linear-progress :value="Number(activeCeremony.progress || 0)" />
      </q-tooltip>
    </q-item>
    <q-item
      clickable
      v-for="i in topDiscussions"
      :key="i?.key"
      active-class="bg-grey-9"
      :to="{
        name: 'convo',
        params: {
          project: activeProjectKey,
          iteration: activeIterationKey,
          ceremony: activeCeremonyKey,
          item: i?.key,
        },
      }"
    >
      <discussion-menu
        :item="i"
        :description="i.info || ''"
        :reporter="
          i.type == 'scrum' && typeof i.assignedTo == 'object'
            ? i.assignedTo
            : undefined
        "
      />
    </q-item>
    <q-item v-if="topDiscussions.length < discussionItems.length">
      <q-btn round icon="more_vert" @click="expandMenu = true"></q-btn>
    </q-item>
  </q-list>
  <q-dialog v-model="expandMenu" position="left">
    <q-list class="bg-dark">
      <q-item
        v-for="element in discussionItems"
        :key="element.key"
        :to="{
          name: 'convo',
          params: {
            project: activeProjectKey,
            iteration: activeIterationKey,
            ceremony: activeCeremonyKey,
            item: element.key,
          },
        }"
      >
        <q-card
          class="list-group-item q-pa-sm board-card no-shadow"
          :class="element.type + '-card'"
          style="width: 200px"
        >
          <component
            :is="getComponent(element)"
            :task="element"
            header-only
            no-action
            mini
          />
        </q-card>
      </q-item>
    </q-list>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ICeremony, IProject } from 'src/entities';
import { useCeremonyStore } from 'src/stores/ceremonies.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useProjectStore } from 'src/stores/projects.store';
import { computed, onMounted, ref } from 'vue';
import DiscussionMenu from 'src/components/discussion/DiscussionMenu.vue';
import { useProfilesStore } from 'src/stores/profiles.store';
import { useRoute } from 'vue-router';
import { entityKey } from 'src/entities/base.entity';
import { useQuasar } from 'quasar';
import { getComponent } from '../task-board/card-components';
getComponent;
const projectStore = useProjectStore();
const ceremonyStore = useCeremonyStore();
const discussionStore = useDiscussionStore();
const profileStore = useProfilesStore();
const $route = useRoute();
const $q = useQuasar();
const activeProjectKey = ref('');
const activeIterationKey = ref('');
const activeCeremonyKey = ref('');
const activeItemKey = ref('');
const activeProject = ref<IProject>();
const activeCeremony = ref<ICeremony>();
const expandMenu = ref(false);
onMounted(async () => {
  await init();
});

async function init() {
  activeProjectKey.value =
    ($route.params.project && String($route.params.project)) || '';
  activeProject.value = projectStore.activeProject;
  activeIterationKey.value = ($route.params.iteration as string) || '';
  activeCeremonyKey.value = ($route.params.ceremony as string) || '';
  activeItemKey.value = ($route.params.item as string) || '';
  activeCeremony.value = await ceremonyStore.withKey(
    activeProjectKey.value,
    activeIterationKey.value,
    activeCeremonyKey.value
  );
}
const discussionItems = computed(() => {
  const list = discussionStore.discussions.filter((d) => {
    if (d.key == activeItemKey.value) return true;
    if (activeCeremony.value?.type == 'planning') {
      return (
        (d.ceremonyKey == activeCeremony.value.key || !d.ceremonyKey) &&
        d.iteration &&
        entityKey(d.iteration) == activeIterationKey.value
      );
    } else {
      return d.ceremonyKey == activeCeremony.value?.key;
    }
  });
  const theUser = profileStore.theUser;
  if (activeCeremony.value?.type == 'scrum' && theUser) {
    const sorted = list.sort((a) => {
      if (
        a.key == activeItemKey.value ||
        (a.type == 'scrum' &&
          a.assignedTo &&
          entityKey(a.assignedTo) == theUser.key)
      ) {
        return -1;
      }
      return 0;
    });
    sorted.push(
      ...discussionStore.discussions.filter(
        (d) =>
          d.type == 'roadblock' &&
          !list.find((s) => s.key == entityKey(d)) &&
          list.find(
            (s) =>
              s.type == 'scrum' &&
              s.roadblocks.find((r) => entityKey(r) == entityKey(d))
          )
      )
    );
    return sorted;
  }
  return list;
});
const topDiscussions = computed(() => {
  const max = $q.screen.gt.sm ? 6 : 4;
  return discussionItems.value.slice(0, max);
});
</script>
<style></style>
